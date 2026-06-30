"use client";
import {
  BarChart,
  BookOpenCheck,
  Calculator,
  CheckCheck,
  Compass,
  Layout,
  LibraryBig,
  List,
  ListChecks,
  PencilRuler,
  PenLine,
  ScanSearch,
  SquareMousePointer,
  NotebookPen,
  TvMinimalPlay,
  Earth,
  GraduationCap,
  Home,
  LucideIcon,
  HelpCircle,
  HandHeart,
  UserRound,
  UsersRound,
  MessageSquare,
  MessagesSquare,
  BarChartBigIcon,
  Award,
  Copy,
  User,
  Timer,
  Bot,
  Shield,
  Settings,
  Users,
  School,
} from "lucide-react";
import { SidebarItem } from "./sidebar-item";
import { SidebarAccord } from "./sidebaraccord";
import { usePathname } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useAdminStatus } from "@/hooks/use-admin-status";

interface RouteItem {
  icon: LucideIcon;
  label: string;
  href: string;
  children?: RouteItem[];
}

interface SidebarRoutesProps {
  onClose?: () => void;
}

const guestRoutes: RouteItem[] = [
  {
    icon: Layout,
    label: "Dashboard",
    href: "/dashboard",
  },
  // {
  //   icon: Compass,
  //   label: "Classes",
  //   href: "/search",
  // },
  {
    icon: GraduationCap,
    label: "Courses",
    href: "/tutoring-program",
  },
  {
    icon: BarChartBigIcon,
    label: "Leaderboard",
    href: "/leaderboard",
  },
  // {
  //   icon: Award,
  //   label: "Our Schools",
  //   href: "/school-hub",
  // },
  {
    icon: Calculator,
    label: "Question Quizzer",
    href: "/quizzer",
  },
  {
    icon: CheckCheck,
    label: "MCQ Mock Exam",
    href: "/mcq-solver",
  },
  {
    icon: Timer,
    label: "Grade Predictor",
    href: "/predictor",
  },
];

const tutorRoutes: RouteItem[] = [
  {
    icon: List,
    label: "My Courses",
    href: "/tutor/courses",
  },
  {
    icon: NotebookPen,
    label: "My Notes",
    href: "/tutor/notes",
  },
  {
    icon: BarChart,
    label: "Analytics",
    href: "/tutor/analytics",
  },
];
const communityRoutes: RouteItem[] = [
  {
    icon: List,
    label: "Courses",
    href: "/tutor/courses",
  },
  {
    icon: NotebookPen,
    label: "Notes",
    href: "/tutor/notes",
  },
  {
    icon: BarChart,
    label: "Analytics",
    href: "/tutor/analytics",
  },
];


const nextroutes: RouteItem[] = [
  {
    icon: LibraryBig,
    label: "Resources",
    href: "1",
    children: [
      {
        icon: BookOpenCheck,
        label: "Past Papers",
        href: "/past-papers",
      },
      {
        icon: NotebookPen,
        label: "Revision Notes",
        href: "/search-notes",
      },
      {
        icon: Bot,
        label: "Tuto",
        href: "/tuto-ai",
      },
      {
        icon: Copy,
        label: "Flashcards",
        href: "/flashcards",
      },
    ],
  },
];

// Admin routes as a dropdown section
const adminSection: RouteItem = {
  icon: Shield,
  label: "Admin",
  href: "admin",
  children: [
    {
      icon: Shield,
      label: "Admin Panel",
      href: "/admin/tutors",
    },
    {
      icon: School,
      label: "School Admin",
      href: "/admin/schools",
    },
  ],
};

export const SidebarRoutes = ({ onClose }: SidebarRoutesProps) => {
  const pathname = usePathname();
  const { userId } = useAuth();
  const { hasAdminAccess } = useAdminStatus(userId);
  
  const isTutorPage = pathname?.startsWith("/tutor/") || pathname === "/tutor";

  const [openItem, setOpenItem] = useState<string | null>(null);

  const handleToggle = (value: string) => {
    setOpenItem((prevOpenItem) => (prevOpenItem === value ? null : value));
  };

  const routes: RouteItem[] = isTutorPage ? tutorRoutes : guestRoutes;

  // Admin section is hidden for all users
  const accordionRoutes = nextroutes;

  return (
    <div className="flex flex-col w-full">
      {routes.map((route) => (
        <SidebarItem
          key={route.href}
          icon={route.icon}
          label={route.label}
          href={route.href}
          onClick={onClose}
        />
      ))}
      {/* About Us — above accordion */}
      <Accordion type="single" collapsible className="w-full">
        {accordionRoutes.map((route) => (
          <AccordionItem key={route.href} value={route.href} className="w-full">
            <AccordionTrigger
              className="w-full"
              onClick={() => handleToggle(route.href)}
            >
              <SidebarAccord
                icon={route.icon}
                label={route.label}
                isOpen={openItem === route.href}
              />
            </AccordionTrigger>
            <AccordionContent className="w-full ">
              <div className="flex flex-col pl-4 w-full h-full">
                {route.children?.map((child) => (
                  <SidebarItem
                    key={child.href}
                    icon={child.icon}
                    label={child.label}
                    href={child.href}
                    onClick={onClose}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {/* About Us — below Resources */}
      <SidebarItem
        icon={NotebookPen}
        label="About Us"
        href="/about"
        onClick={onClose}
      />
    </div>
  );
};