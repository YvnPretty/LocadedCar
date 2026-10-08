"use client";

import WorkflowNavigation from "@/components/WorkflowNavigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RouteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <WorkflowNavigation />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}