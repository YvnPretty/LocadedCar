"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RouteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStaffArea = pathname.startsWith("/admin") || pathname.startsWith("/pos");

  if (isStaffArea) {
    return children;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}