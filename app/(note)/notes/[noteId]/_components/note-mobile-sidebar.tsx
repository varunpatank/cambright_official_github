// v.0.0.01 salah

import { Menu } from "lucide-react";
import { NoteChapter, Note, NoteUserProgress } from "@prisma/client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NoteSidebar } from "./note-sidebar";

interface NoteMobileSidebarProps {
  note: Note & {
    notechapters: (NoteChapter & {
      noteuserProgress: NoteUserProgress[] | null;
    })[];
  };
  progressCount: number;
}

export const NoteMobileSidebar = ({
  note,
  progressCount,
}: NoteMobileSidebarProps) => {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
        <Menu />
      </SheetTrigger>
      <SheetContent className="p-0  w-72 bg-n-8" side="left">
        <NoteSidebar note={note} progressCount={progressCount} />
      </SheetContent>
    </Sheet>
  );
};
