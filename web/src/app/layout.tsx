import type { Metadata, Viewport } from "next";
import { Manrope, Sora } from "next/font/google";
import "./globals.css";
import { ConnectivityBar } from "@/components/connectivity-bar";
import { RegisterSW } from "@/components/register-sw";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Yekola - Apprendre. Pratiquer. Prouver.",
  description:
    "Infrastructure de formation professionnelle intelligente, conçue pour fonctionner avec ou sans Internet en RDC et en Afrique.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Yekola" },
};

export const viewport: Viewport = {
  themeColor: "#0d3d2e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${manrope.variable} ${sora.variable} antialiased`}>
        <ConnectivityBar />
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
