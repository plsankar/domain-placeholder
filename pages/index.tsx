import type { GetServerSideProps, NextPage } from "next";
import ContactForm from "@/components/ContactForm";

type Props = { host: string | null };

export const getServerSideProps: GetServerSideProps<Props> = async (context) => ({
    props: { host: context.req.headers.host || null },
});

const Page: NextPage<Props> = ({ host }) => {
    const title = host ? host : window ? window.location.host : "";
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
                    <p className="font-normal">Coming Soon.</p>
                    <ContactForm />
                </div>
            </main>
        </>
    );
};

export default Page;
