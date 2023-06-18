import isEmail from "isemail";
import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

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
    const name = req.body["name"];
    const email = req.body["email"];
    const message = req.body["message"];

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

    if (!name || name === "") {
        res.status(400).json({
            success: false,
            message: "Please enter your name",
        });
        return;
    }

    if (!message || message === "") {
        res.status(400).json({
            success: false,
            message: "Please enter your message",
        });
        return;
    }

    try {
        if (process.env.NODE_ENV !== "development") {
            const params = new URLSearchParams();
            params.append("secret", process.env.HCAPTCHA_SECRET ?? "");
            params.append("response", `${hCaptchResponse}`);

            const response = await fetch("https://hcaptcha.com/siteverify", {
                method: "POST",
                body: params,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            const json = (await response.json()) as HCaptchaVerifyResponse;

            console.log(json);
            const { success } = json;
            if (!success) {
                res.status(400).json({
                    success: false,
                    message: "Please verify you are not a bot",
                });
                return;
            }
        }

        const data = new FormData();
        data.append("email", email);
        data.append("name", name);
        data.append("message", message);
        data.append("email", email);
        data.append("access_key", process.env.ACCESS_KEY ?? "");
        data.append("subject", `Domain contact form submitted for ${req.headers.host}`);

        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(Object.fromEntries(data)),
        });

        console.log(req.headers.host);
        console.log(await response.json());

        if (response.status == 200) {
            res.status(200).json({ success: true, message: "Sent!" });
        } else {
            res.status(200).json({ success: false, message: "Failed! Please try again later" });
        }
    } catch (err: any) {
        console.log(err);
        res.status(500).json({ success: false, message: "Unknown Error! Please try again later" });
    }
};

export default handler;
