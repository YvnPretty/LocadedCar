import type { Metadata } from "next";

import "./globals.css";
import RouteShell from "@/components/RouteShell";



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
    <html lang="es">
      <body className="antialiased min-h-screen">
        <RouteShell>{children}</RouteShell>
      </body>
    </html>
  );
}
