import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import image from "../app/workshop/favicon.ico";

import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "MotoFix",
  description: "Plataforma para gestión de talleres mecánicos - Tu mejor opción",
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
        { }
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}