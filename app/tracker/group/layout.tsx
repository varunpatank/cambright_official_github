"use client";

import { TrackerNavbar } from "../_components/tracker-navbar";
import TrackerSidebar from "./[groupId]/_components/TrackerSidebar";
import { cn } from "@/lib/utils";
import "./customertwo.css";

const TrackerLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full flex flex-col">
      {/* Navbar */}
      <div className="h-[80px] fixed top-0 left-0 w-full z-50 ">
        <TrackerNavbar />
      </div>

      {/* Sidebar */}
      <div className="hidden md:flex fixed top-[80px] left-0 h-full w-64 z-40">
        <TrackerSidebar />
      </div>

      {/* Main Content */}
      <main className="h-full pt-[35px] md:pl-[17rem] pl-4">{children}</main>
    </div>
  );
};

export default TrackerLayout;
