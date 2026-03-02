import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Entrenador de Verbos Diarios",
  description: "Aprende verbos irregulares en inglés con repetición espaciada",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-slate-100 flex items-center justify-center min-h-screen p-4`}>
        <div id="app-container" className="w-full max-w-2xl mx-auto relative">
          {children}
        </div>
      </body>
    </html>
  );
}