import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Jost, Manrope } from "next/font/google";
import { Toaster } from "react-hot-toast";

const jost = Jost({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-jost",
});

const manrope = Manrope({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-manrope",
});

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <style jsx global>{`
                html {
                    --font-jost: ${jost.style.fontFamily};
                    --font-manrope: ${manrope.style.fontFamily};
                }
            `}</style>
            <Component {...pageProps} />
            <Toaster position="bottom-center" />
        </>
    );
}
