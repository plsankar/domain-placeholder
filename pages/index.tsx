import type { GetServerSideProps, NextPage } from "next";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { FormEvent, useRef, useState } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import { ApiResponse } from "./api/subscribe";
import isEmail from "isemail";

type Props = { host: string | null };

export const getServerSideProps: GetServerSideProps<Props> = async (context) => ({
    props: { host: context.req.headers.host || null },
});

const Page: NextPage<Props> = ({ host }) => {
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const title = host ? host : window ? window.location.host : "";
    const form = useRef<HTMLFormElement>(null);
    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);

    function handleSubmission(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (loading) {
            return true;
        }
        if (!captchaToken || captchaToken == "") {
            toast.error("Please verify you are not a bot");
            return;
        }
        if (!isEmail.validate(email)) {
            toast.error("Please enter a valid email address");
            return;
        }
        setLoading(true);
        const loadingToastId = toast.loading("Subscribing...");
        axios<ApiResponse>("/api/subscribe", {
            method: "POST",
            headers: {
                "g-recaptcha-response": captchaToken,
                "content-type": "application/json",
                Accept: "application/json",
            },
            data: {
                email,
            },
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

    return (
        <>
            <title>{host}</title>
            <main className="flex items-center justify-center min-w-full min-h-screen text-gray-600">
                <div className="max-w-[350px] p-5 flex flex-col gap-4">
                    {title.length > 0 && (
                        <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded logo">
                            <p className="text-2xl font-light leading-none">{title.charAt(0)}</p>
                        </div>
                    )}
                    <h1 className="text-3xl font-light text-black">{host}</h1>
                    <p className="font-normal">This domain may be available for sale.</p>
                    <div className="flex flex-col gap-4 py-3 pt-10 border-t border-r-black">
                        <h2 className="text-xl">Subscribe to updates</h2>
                        <form method="post" onSubmit={handleSubmission} ref={form}>
                            <label htmlFor="email" className="block mb-1 text-sm">
                                Enter your email address
                            </label>
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="text"
                                name="email"
                                id="email"
                                className="w-full mb-4 text-sm border-gray-400"
                                placeholder="jhon@doe.com"
                            />
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
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
};

export default Page;
