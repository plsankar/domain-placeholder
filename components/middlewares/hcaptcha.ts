import { ApiResponse } from "@/pages/api/subscribe";
import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

// for docs see: https://docs.hcaptcha.com/

export type HCaptchaVerifyResponse = {
    success: boolean;
};

const hcaptcha = (f: any) => {
    async (req: NextApiRequest, res: NextApiResponse<ApiResponse>) => {
        console.log(req.body["g-recaptcha-response"]);

        if (process.env.NODE_ENV === "development") {
            await f(req, res);
            return;
        }

        const params = new URLSearchParams();
        params.append("secret", process.env.HCAPTCHA_SECRET ?? "");
        params.append(
            "response",
            req.body["g-recaptcha-response"] || req.body["h-captcha-response"]
        );

        const response = await fetch("https://hcaptcha.com/siteverify", {
            method: "POST",
            body: params,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        const json = (await response.json()) as HCaptchaVerifyResponse;
        const { success } = json;
        if (success) {
            await f(req, res);
        } else {
            res.status(400).json({
                success: false,
                message: "Please verify you are not a bot",
            });
        }
    };
};

export default hcaptcha;
