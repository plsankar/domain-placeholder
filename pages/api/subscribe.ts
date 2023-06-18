import isEmail from "isemail";
import type { NextApiRequest, NextApiResponse } from "next";

export type ApiResponse = {
    success: boolean;
    message: string;
};

export type HCaptchaVerifyResponse = {
    success: boolean;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<ApiResponse>) => {
    if (req.method !== "POST") {
        res.status(400).json({
            success: false,
            message: "Only POST method requests are allowed",
        });
        return;
    }

    const hCaptchResponse = req.headers["g-recaptcha-response"];
    const email = req.body["email"];

    if (!hCaptchResponse || hCaptchResponse === "") {
        res.status(400).json({
            success: false,
            message: "Please verify you are not a bot",
        });
        return;
    }

    if (!email || email === "" || !isEmail.validate(email)) {
        res.status(400).json({
            success: false,
            message: "Please enter a valid email address",
        });
        return;
    }
    try {
        if (process.env.NODE_ENV !== "development") {
            const params = new URLSearchParams();
            params.append("secret", process.env.HCAPTCHA_SECRET ?? "");
            params.append("response", req.body["g-recaptcha-response"] || req.body["h-captcha-response"]);

            const response = await fetch("https://hcaptcha.com/siteverify", {
                method: "POST",
                body: params,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            const json = (await response.json()) as HCaptchaVerifyResponse;
            const { success } = json;
            if (!success) {
                res.status(400).json({
                    success: false,
                    message: "Please verify you are not a bot",
                });
                return;
            }
        }
        res.status(200).json({ success: true, message: "Subscribed!" });
    } catch (err: any) {
        res.status(500).json({ success: false, message: "Unknown Error! Please try again later" });
    }
};

export default handler;
