import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ConnectivityBar } from "@/components/connectivity-bar";
import { RegisterSW } from "@/components/register-sw";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" style={{ fontFamily: "Manrope, system-ui, sans-serif" }}>
        <ConnectivityBar />
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
