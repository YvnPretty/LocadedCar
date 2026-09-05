import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LocadedCar | Vehículos Deportivos y Semideportivos",
  description: "Descubre nuestra colección exclusiva de vehículos deportivos y semideportivos de alta gama.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} antialiased selection:bg-white/30 selection:text-white`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
