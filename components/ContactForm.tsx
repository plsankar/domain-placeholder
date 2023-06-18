import React from "react";
import { FormEvent, useRef, useState } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import { ApiResponse } from "@/pages/api/contact";
import isEmail from "isemail";
import HCaptcha from "@hcaptcha/react-hcaptcha";

const ContactForm = () => {
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const form = useRef<HTMLFormElement>(null);
    const [data, setData] = useState({
        name: "",
        email: "",
        message: "",
    });

    const [loading, setLoading] = useState(false);

    function handleSubmission(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (loading) {
            return true;
        }
        if (!isValid()) {
            return;
        }
        if (!captchaToken || captchaToken == "") {
            toast.error("Please verify you are not a bot");
            return;
        }

        setLoading(true);
        const loadingToastId = toast.loading("Sending...");
        axios<ApiResponse>("/api/contact", {
            method: "POST",
            headers: {
                "g-recaptcha-response": captchaToken,
                "content-type": "application/json",
                Accept: "application/json",
            },
            data: data,
        })
            .then((res) => {
                toast.dismiss(loadingToastId);
                const { success, message } = res.data;
                if (success) {
                    toast.success(message);
                } else {
                    toast.error(message);
                }
                form.current?.reset();
            })
            .catch((error: AxiosError<ApiResponse>) => {
                toast.dismiss(loadingToastId);
                console.error(error);
                const message = error.response?.data?.message ?? "Unknown Error!, Please try again later";
                toast.error(message);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    function isValid() {
        if (data.name === "") {
            toast.error("Please enter your name");
            return false;
        }
        if (!isEmail.validate(data.email)) {
            toast.error("Please enter a valid email address");
            return false;
        }
        if (data.message === "") {
            toast.error("Please enter your message");
            return false;
        }
        return true;
    }

    return (
        <div className="flex flex-col gap-4 py-3 border-t border-r-black">
            <h2 className="text-xl">Get in touch</h2>
            <form method="post" onSubmit={handleSubmission} ref={form}>
                <div>
                    <label htmlFor="name" className="block mb-1 text-sm">
                        Enter your name
                    </label>
                    <input
                        value={data.name}
                        onChange={(e) =>
                            setData((data) => {
                                return {
                                    ...data,
                                    name: e.target.value,
                                };
                            })
                        }
                        type="text"
                        name="name"
                        id="name"
                        className="w-full mb-4 text-sm border-gray-400"
                        placeholder="Jhon Doe"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block mb-1 text-sm">
                        Enter your email address
                    </label>
                    <input
                        value={data.email}
                        onChange={(e) =>
                            setData((data) => {
                                return {
                                    ...data,
                                    email: e.target.value,
                                };
                            })
                        }
                        type="email"
                        name="email"
                        id="email"
                        className="w-full mb-4 text-sm border-gray-400"
                        placeholder="jhon@doe.com"
                    />
                </div>
                <div>
                    <label htmlFor="message" className="block mb-1 text-sm">
                        Enter your message
                    </label>
                    <textarea
                        value={data.message}
                        onChange={(e) =>
                            setData((data) => {
                                return {
                                    ...data,
                                    message: e.target.value,
                                };
                            })
                        }
                        rows={3}
                        name="message"
                        id="message"
                        className="w-full mb-4 text-sm border-gray-400"
                        placeholder="..."
                    />
                </div>
                <div className="mb-4">
                    <HCaptcha
                        sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? ""}
                        onVerify={(token) => {
                            setCaptchaToken(token);
                        }}
                        onError={() => setCaptchaToken(null)}
                        onExpire={() => setCaptchaToken(null)}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm text-white transition bg-black border border-black hover:bg-transparent hover:text-black disabled:opacity-10"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default ContactForm;
