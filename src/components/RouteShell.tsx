"use client";

import { usePathname } from "next/navigation";
import WorkflowNavigation from "@/components/WorkflowNavigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RouteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStaffArea = pathname.startsWith("/admin") || pathname.startsWith("/pos");

  if (isStaffArea) {
    return <><WorkflowNavigation />{children}</>;
  }

  return (
    <>
      <Navbar />
      <WorkflowNavigation />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}