// v.0.0.01 salah

import NavbarRoutes from "@/components/navbar-routes";
import {
  Chapter,
  Note,
  NoteChapter,
  NoteUserProgress,
  UserProgress,
} from "@prisma/client";
import { NoteMobileSidebar } from "./note-mobile-sidebar";

interface NoteNavbarProps {
  note: Note & {
    notechapters: (NoteChapter & {
      noteuserProgress: NoteUserProgress[] | null;
    })[];
  };
  progressCount: number;
}

export const NoteNavbar = ({ note, progressCount }: NoteNavbarProps) => {
  return (
    <div className="p-4 border-b h-full flex items-center border-n-6 bg-n-8/90 backdrop-blur-sm shadow-sm">
      {note.notechapters.length > 0 && (
        <NoteMobileSidebar note={note} progressCount={progressCount} />
      )}
      <NavbarRoutes />
    </div>
  );
};
