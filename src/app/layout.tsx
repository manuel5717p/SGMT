import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import image from "./favicon.ico";

import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "MotoFix",
  description: "Plataforma para gestión de talleres mecánicos - Tu mejor opción",
  icons: {
    icon: image.src,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
        <Toaster position="top-right" richColors />
        <SpeedInsights />
      </body>
    </html>
  );
}