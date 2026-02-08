"use client";
import Sidebar from "../(dashboard)/_components/sidebar";
import Navbar from "../(dashboard)/_components/navbar";
import { usePathname } from "next/navigation";
import { ModalProvider } from "@/components/providers/modal-provider";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isGroupPage = pathname?.includes("/group");
  const isSprintPage =
    pathname?.includes("/sprint") || pathname?.includes("/template-sprint");
  return (
    <div className="h-full bg-black min-h-screen">
      {/* Navbar */}
      {!isGroupPage && (
        <div
          className={`h-[80px] ${
            !isGroupPage && !isSprintPage && "md:pl-56"
          } fixed inset-y-0 w-full z-50`}
        >
          <Navbar />
        </div>
      )}

      {/* Sidebar */}
      {!isGroupPage && !isSprintPage && (
        <div className="hidden md:flex h-full w-56 flex-col fixed inset-y-0 z-50">
          <Sidebar />
        </div>
      )}

      {/* Main content */}
      <main
        className={`${
          !isGroupPage && !isSprintPage ? "md:pl-56" : ""
        } h-full pt-[80px] flex items-center justify-center`}
      >
        <ModalProvider />
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
