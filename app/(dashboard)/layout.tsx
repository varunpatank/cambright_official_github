// v.0.0.01 salah
"use client";
import Sidebar from "./_components/sidebar";
import Navbar from "./_components/navbar";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const path = usePathname();
  {
    if (path !== "/")
      return (
        <div className="h-full">
          {/* Navbar */}
          <div className="h-[80px] md:pl-56 fixed inset-y-0 w-full z-50">
            <Navbar />
          </div>

          {/* Sidebar */}
          <div className="hidden md:flex h-full w-56 flex-col fixed inset-y-0 z-50">
            <Sidebar />
          </div>

          {/* Main content */}
          <main className="md:pl-56 h-full pt-[80px]">{children}</main>
          <Toaster />
        </div>
      );
  }
  if (path === "/") {
    return (
      <div className="h-full">
        <main className="">{children}</main>
      </div>
    );
  }
};

export default DashboardLayout;
