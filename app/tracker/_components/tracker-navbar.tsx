// v.0.0.01 salah

import NavbarRoutes from "@/components/navbar-routes";
import {
  Chapter,
  Note,
  NoteChapter,
  NoteUserProgress,
  UserProgress,
} from "@prisma/client";
import { MobileSidebar } from "./MobileSidebar";

export const TrackerNavbar = () => {
  return (
    <div className="p-4 border-b h-full flex items-center border-n-6 bg-n-8/90 backdrop-blur-sm shadow-sm">
      <MobileSidebar />
      <NavbarRoutes />{" "}
    </div>
  );
};
