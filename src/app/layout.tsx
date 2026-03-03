import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from 'next-auth';
import SessionProvider from '@/components/SessionProvider';
import LoginButton from '@/components/LoginButton';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Entrenador de Verbos Diarios",
    description: "Aprende verbos irregulares en inglés con repetición espaciada",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession();

    return (
        <html lang="es">
            <body className={`${inter.className} bg-slate-100 flex items-center justify-center min-h-screen p-4`}>
                <SessionProvider session={session}>
                    <div id="app-container" className="w-full max-w-2xl mx-auto relative">
                        {/* Login button — esquina superior derecha */}
                        <div className="absolute top-0 right-0 p-2 z-10">
                            <LoginButton />
                        </div>
                        {children}
                    </div>
                </SessionProvider>
            </body>
        </html>
    );
}