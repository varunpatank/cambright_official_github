// Spotlight / preview video file ID from the all-videos Drive folder:
// https://drive.google.com/drive/folders/1CkPFYQ62ncIyPm1xxQmTobyoa41n4-mw
// TODO: replace SPOTLIGHT_VIDEO_ID with the specific preview video file ID from that folder
export const SPOTLIGHT_VIDEO_ID = "1BW2YvuoStn5ePfDmTrlgfQZQ0XZbw7Oh"; // placeholder – update with math preview file ID
export const ALL_VIDEOS_FOLDER = "https://drive.google.com/drive/folders/1CkPFYQ62ncIyPm1xxQmTobyoa41n4-mw";

export interface CourseLink {
  icon: "zoom" | "video" | "file" | "folder";
  label: string;
  href: string;
}

export interface CourseData {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  authorTag: string | null;
  /** Clerk user ID — used to fetch profile picture via /api/tutor-avatar/[userId] */
  clerkUserId?: string;
  /** Short role label shown under the author's name */
  authorRole?: string;
  accentFrom: string;
  accentTo: string;
  glowRgb: string;
  image: string;
  chaptersCount: number;
  tagLabel: string;
  tagStyle: string;
  shortDescription: string;
  isSpotlight?: boolean;
}

export const COURSES: CourseData[] = [
  {
    id: "addmaths-0606",
    title: "Add. Mathematics 0606",
    subtitle: "CIE IGCSE — Full Course by Ate",
    author: "Ate",
    authorTag: null,
    // TODO: set clerkUserId to Ate's Clerk user ID once known
    clerkUserId: undefined,
    authorRole: "CIE IGCSE Add. Maths Tutor",
    accentFrom: "#a78bfa",
    accentTo: "#7c3aed",
    glowRgb: "167,139,250",
    image: "/addmathsTH.png",
    chaptersCount: 0,
    tagLabel: "LIVE SESSIONS",
    tagStyle: "bg-violet-500/20 text-violet-300 border-violet-400/40",
    shortDescription: "CIE IGCSE Additional Mathematics 0606 — a full live-tutoring course by Ate. More details coming soon.",
    isSpotlight: true,
  },
  {
    id: "math-0580-unit-2",
    title: "Mathematics 0580",
    subtitle: "Unit 2 — Algebra & Graphs",
    author: "A.S",
    authorTag: null,
    // TODO: set clerkUserId to A.S's Clerk user ID once known
    clerkUserId: undefined,
    authorRole: "CIE IGCSE Mathematics Tutor",
    accentFrom: "#22d3ee",
    accentTo: "#3b82f6",
    glowRgb: "34,211,238",
    image: "/coursess/1_image.png",
    chaptersCount: 9,
    tagLabel: "LIVE SESSIONS",
    tagStyle: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
    shortDescription: "A structured live-tutoring series covering the full Unit 2 Cambridge IGCSE Maths syllabus — from foundational algebra to advanced graph sketching.",
  },
  {
    id: "biology-igcse",
    title: "Biology IGCSE",
    subtitle: "Full Syllabus by Miki",
    author: "Miki",
    authorTag: "@MikiGoesBoom",
    // TODO: set clerkUserId to Miki's Clerk user ID once known
    clerkUserId: undefined,
    authorRole: "CIE IGCSE Biology Tutor",
    accentFrom: "#34d399",
    accentTo: "#0d9488",
    glowRgb: "52,211,153",
    image: "/coursess/2_image.png",
    chaptersCount: 1,
    tagLabel: "VIDEO COURSE",
    tagStyle: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
    shortDescription: "heya! Im Miki — here to make biology easy! After this you'll definitely crush your biology exams. Happy to see you around!",
  },
  {
    id: "chemistry-igcse",
    title: "Chemistry IGCSE",
    subtitle: "Full Syllabus by Miki",
    author: "Miki",
    authorTag: "@MikiGoesBoom",
    clerkUserId: undefined,
    authorRole: "CIE IGCSE Chemistry Tutor",
    accentFrom: "#fb923c",
    accentTo: "#ef4444",
    glowRgb: "251,146,60",
    image: "/coursess/3_Image.png",
    chaptersCount: 1,
    tagLabel: "VIDEO COURSE",
    tagStyle: "bg-orange-500/20 text-orange-300 border-orange-400/40",
    shortDescription: "Chemistry is fun when you get it! Together we'll ace the exam and blow the examiner's mind — literally and figuratively.",
  },
];
