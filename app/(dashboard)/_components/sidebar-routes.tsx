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
  {
    icon: Compass,
    label: "Classes",
    href: "/search",
  },
  {
    icon: BarChartBigIcon,
    label: "Leaderboard",
    href: "/leaderboard",
  },
  {
        icon: Award,
        label: "Our Schools",
        href: "/school-hub",
      },
];

const tutorRoutes: RouteItem[] = [
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
    icon: PencilRuler,
    label: "Tools",
    href: "1",
    children: [
      {
        icon: CheckCheck,
        label: "MCQ Mock Exam",
        href: "/mcq-solver",
      },
      {
        icon: Calculator,
        label: "Question Quizzer",
        href: "/quizzer",
      },
      {
        icon: Bot,
        label: "Tuto AI",
        href: "/tuto-ai",
      },
      {
        icon: Timer,
        label: "Marks Predictor",
        href: "/predictor",
      },
      // {
      //   icon: Calculator,
      //   label: "Predictor",
      //   href: "/predictor",
      // },
      // {
      //   icon: PenLine,
      //   label: "Mock exam",
      //   href: "/mockexam",
      // },
      {
        icon: ListChecks,
        label: "Progress Tracker",
        href: "/tracker/select-group",
      },

      // {
      //   icon: ScanSearch,
      //   label: "Question Finder",
      //   href: "/questionsearch",
      // },
      // {
      //   icon: SquareMousePointer,
      //   label: "Quiz generator",
      //   href: "/quizzer",
      // },


    ],
  },
  {
    icon: LibraryBig,
    label: "Resources",
    href: "/resources",
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
        icon: TvMinimalPlay,
        label: "Courses",
        href: "/search-courses",
      },
      {
        icon: Copy,
        label: "Flashcards",
        href: "/flashcards",
      },
    ],
  },
  {
    icon: Earth,
    label: "Site",
    href: "/site",
    children: [
      {
        icon: Home,
        label: "Landpage",
        href: "/home",
      },
      {
        icon: GraduationCap,
        label: "Become a tutor",
        href: "/tutor-apply",
      },
      {
        icon: NotebookPen,
        label: "About Us",
        href: "/about",
      },
      {
        icon: HelpCircle,
        label: "Help Center",
        href: "/help",
      },
      {
        icon: HandHeart,
        label: "Donate",
        href: "/donate",
      },
      {
        icon: User,
        label: "Profile",
        href: "/profile",
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
  
  const isTutorPage = pathname?.includes("/tutor");

  const [openItem, setOpenItem] = useState<string | null>(null);

  const handleToggle = (value: string) => {
    setOpenItem((prevOpenItem) => (prevOpenItem === value ? null : value));
  };

  const routes: RouteItem[] = isTutorPage ? tutorRoutes : guestRoutes;

  // Create accordion routes array that includes admin section if user has access
  const accordionRoutes = hasAdminAccess ? [...nextroutes, adminSection] : nextroutes;

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
    </div>
  );
};