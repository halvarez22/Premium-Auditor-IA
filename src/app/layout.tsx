import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Auditor-IA | Inteligencia Contable y Fiscal",
    description: "Auditoría inteligente para el sector transportes mediante IA y análisis masivo de datos.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className={outfit.className}>
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <main className="relative min-h-screen">
                    {children}
                </main>
            </body>
        </html>
    );
}
