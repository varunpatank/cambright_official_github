// v0.0.06 – sharpen icons (240 px) + refreshed Comp Sci, Economics & Business icons
import { NoteBoard, Note, NoteSubject } from "@prisma/client";
import { NoteCard } from "./note-card";
import { NoteCardMol } from "./note-card-mol";

type NoteWithProgressWithSubject = Note & {
  notesubject: NoteSubject | null;
  noteboard: NoteBoard | null;
  notechapters: { id: string; sessionlink: string }[];
  progress: number | null;
};

interface NotesListProps {
  prevImage?: boolean;
  items: NoteWithProgressWithSubject[];
}

export const NotesList = ({ items, prevImage = true }: NotesListProps) => {
  return (
    <div>
      <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grod-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        {/* EXISTING CARDS (unchanged) */}
        <NoteCardMol
          zoomed="scale-150"
          key="alchemistry"
          id="alchemistry"
          title="AL/AS Chemistry"
          imageUrl="/beaker.png"
          chaptersLength={12}
          progress={34}
          subject="AL/AS Chemistry"
          board="Cambridge"
          isOnline={false}
          noteOwner="user_2lFzt9TAlxAqaiWPbYNCDmQv8kL"
        />
        <NoteCardMol
          zoomed="scale-150"
          key="efl"
          id="efl"
          title="English As First Language"
          imageUrl="/britain.png"
          chaptersLength={6}
          progress={78}
          subject="EFL"
          board="Cambridge IGCSE"
          isOnline={false}
          noteOwner="user_2lFzt9TAlxAqaiWPbYNCDmQv8kL"
        />

        {/* ---------- IGCSE SUBJECT CARDS ---------- */}
        {[
          {
            id: "igcse-sociology",
            title: "IGCSE Sociology",
            img: "https://img.icons8.com/color/240/classroom.png",
            drive: "https://drive.google.com/drive/folders/1zOQ2wAFLi4XEtQAaKlOWOZBVXjSMUtT0",
            subject: "Sociology",
          },
          {
            id: "igcse-physics",
            title: "IGCSE Physics",
            img: "https://img.icons8.com/color/240/physics.png",
            drive: "https://drive.google.com/drive/folders/1igZgjFA-0DfMkTRsBhEvpa0vqJ5EirNq",
            subject: "Physics",
          },
          {
            id: "igcse-maths",
            title: "IGCSE Mathematics",
            img: "https://img.icons8.com/color/240/pi.png",
            drive: "https://drive.google.com/drive/folders/1A_HeadqLhewDKcB2vNW5UEQr8F-oiSva",
            subject: "Mathematics",
          },
          {
            id: "igcse-ict",
            title: "IGCSE ICT",
            img: "https://img.icons8.com/color/240/internet.png",
            drive: "https://drive.google.com/drive/folders/1IluJM6LcXhlHeWKpMFGVx6FPxnfKCe0U",
            subject: "ICT",
          },
          {
            id: "igcse-german",
            title: "IGCSE German",
            img: "https://img.icons8.com/color/240/germany.png",
            drive: "https://drive.google.com/drive/folders/1L6-hqOTxuXaYDDnXd_0zTMVoAg1w_7xx",
            subject: "German",
          },
          {
            id: "igcse-geography",
            title: "IGCSE Geography",
            img: "https://img.icons8.com/color/240/globe.png",
            drive: "https://drive.google.com/drive/folders/1nUgf8gKdFJjJS8m6oKT2BvvrW3FWW_r5",
            subject: "Geography",
          },
          {
            id: "igcse-env-mgmt",
            title: "IGCSE Environmental Management",
            img: "https://img.icons8.com/color/240/earth-planet.png",
            drive: "https://drive.google.com/drive/folders/1Fc0gQ1csm2cZaVLNMTElg-uWwFQS9SN8",
            subject: "Environmental Mgmt",
          },
          {
  id: "igcse-economics",
  title: "IGCSE Economics",
  img: "https://img.icons8.com/emoji/48/money-with-wings-emoji.png", // ✅ this file exists
  drive: "https://drive.google.com/drive/folders/1dtxAYpIxEnyV8x-1qqKcpb_qhAE8XZ-x",
  subject: "Economics",
},
          {
            id: "igcse-compsci",
            title: "IGCSE Computer Science",
            img: "https://img.icons8.com/color/240/source-code.png",
            drive: "https://drive.google.com/drive/folders/1rETiWVo8158cKZBsjLIoGr7nbSiVOiqi",
            subject: "Computer Science",
          },
          {
            id: "igcse-chemistry",
            title: "IGCSE Chemistry",
            img: "https://img.icons8.com/color/240/laboratory.png",
            drive: "https://drive.google.com/drive/folders/1tvcOpT2Pip5-tB-274d2GBbP2m6pI-t-",
            subject: "Chemistry",
          },
          {
            id: "igcse-business",
            title: "IGCSE Business Studies",
            img: "https://img.icons8.com/color/240/briefcase.png",
            drive: "https://drive.google.com/drive/folders/1FagrQGQ6RYe0llk4wATGuxQZdQ8mYJAy",
            subject: "Business Studies",
          },
          {
            id: "igcse-biology",
            title: "IGCSE Biology",
            img: "https://img.icons8.com/color/240/microscope.png",
            drive: "https://drive.google.com/drive/folders/12oisQT_Vyv1Xk1fjWVfMkJ28NlJeKzqE",
            subject: "Biology",
          },
          {
            id: "igcse-accounting",
            title: "IGCSE Accounting",
            img: "https://img.icons8.com/color/240/accounting.png",
            drive: "https://drive.google.com/drive/folders/1gdhkCmRxH_M4BtQvssPzqqHdMHJDcsKH",
            subject: "Accounting",
          },
        ].map(({ id, title, img, drive, subject }) => (
          <div key={id} className="relative">
            {/* Card itself */}
            <NoteCardMol
              zoomed="scale-110"
              id={id}
              title={title}
              imageUrl={img}
              chaptersLength={0}
              progress={0}
              subject={subject}
              board="Cambridge IGCSE"
              isOnline
              noteOwner="system"
            />
            {/* Invisible overlay captures the click */}
            <a
              href={drive}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 z-50"
            />
          </div>
        ))}

        {/* ---------- DYNAMIC SUPPLIED NOTES ---------- */}
        {items.map((item) => (
          <NoteCard
            key={item.id}
            id={item.id}
            title={item.title}
            imageUrl={item.imageUrl!}
            chaptersLength={item.notechapters.length}
            progress={item.progress}
            subject={item.notesubject?.name!}
            board={item.noteboard?.name!}
            isOnline={Boolean(item.notechapters.map((ch) => ch.sessionlink))}
            noteOwner={item.userId}
          />
        ))}
      </div>
    </div>
  );
};
