import type { Metadata, Viewport } from "next";
import { Nunito, Fredoka, Playfair_Display } from "next/font/google";
import "./globals.css";
import ErrorReporter from "@/components/ErrorReporter";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Niverr — convites de aniversário",
  description: "Crie o convite do aniversário, envie pelo WhatsApp e acompanhe quem confirmou.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ec4899" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${nunito.variable} ${fredoka.variable} ${playfair.variable} font-sans antialiased`}>
        <ErrorReporter />
        {children}
      </body>
    </html>
  );
}
