// v0.0.01 Salah
"use client";

import {
  ClerkLoaded,
  ClerkLoading,
  OrganizationSwitcher,
  useAuth,
  UserButton,
} from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import {
  Dot,
  Home,
  Loader,
  LogOut,
  Plus,
  TvMinimalPlay,
  User,
} from "lucide-react";
import Link from "next/link";
import ModeToggle from "./ui/theme-toggle";
import { SearchInput } from "./search-input";
import { SearchInputNotes } from "./search-input-notes";
import { useTutorStatus } from "@/hooks/use-tutor-status";
import { useEffect } from "react";
import { Logo } from "@/app/(dashboard)/_components/logo";
import { LogoR } from "@/app/(dashboard)/_components/logoR";

const NavbarRoutes = () => {
  const router = useRouter();
  const { userId } = useAuth();
  const { isTutor: isUserTutor, isLoading: tutorStatusLoading } = useTutorStatus(userId);

  // Use useEffect to call router.refresh() after render
  useEffect(() => {
    if (userId) {
      router.refresh();
    }
  }, [userId, router]);
  const pathname = usePathname();

  const isTutorPage = pathname?.startsWith("/tutor");
  const isCoursePage = pathname?.includes("/courses");
  const isNotePage = pathname?.includes("/notes");
  const isSearchPage = pathname === "/search" || pathname === "/search-courses";
  const isNotesPage = pathname === "/search-notes";
  const isTrackerPage =
    (pathname?.includes("/group") || pathname?.includes("/tracker")) &&
    !pathname?.includes("/select-group");

  const isSprintPage =
    pathname?.includes("/sprint") || pathname?.includes("/template-sprint");

  const SprintOrTracker =
    pathname?.includes("/group") ||
    pathname?.includes("/sprint") ||
    pathname?.includes("/template-sprint");

  // Determine if we should show the tutor mode button
  const shouldShowTutorButton = !tutorStatusLoading && isUserTutor;
  const shouldShowExitButton = isTutorPage || isTrackerPage || isCoursePage || isNotePage;

  return (
    <>
      {SprintOrTracker && (
        <div className="flex items-center">
          <div className="hidden md:flex">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          {/* <Button className="ml-4 text-[1rem] h-auto py-2 px-3 hidden md:block">
            Create
          </Button>{" "}
          <Button className="ml-4  md:hidden block" size={"sm"}>
            <Plus className="h-5 w-5" />
          </Button> */}
        </div>
      )}
      {isSearchPage && (
        <div className="hidden md:block">
          <SearchInput />
        </div>
      )}{" "}
      {isNotesPage && (
        <div className="hidden md:block">
          <SearchInputNotes />
        </div>
      )}{" "}
      <div className="flex gap-x-2 ml-auto">
        {shouldShowExitButton ? null : null}
        <ClerkLoading>
          <Loader className="h-5 w-5 to-muted-foreground animate-spin" />
        </ClerkLoading>
        <ClerkLoaded>
          <UserButton afterSwitchSessionUrl="/home" afterSignOutUrl="/">
            <UserButton.UserProfileLink
              label="Dashboard"
              url="/dashboard"
              labelIcon={<Home className="size-5" />}
            />
            <UserButton.UserProfileLink
              label="Public Profile"
              url="/profile"
              labelIcon={<User className="size-5" />}
            />
          </UserButton>
          {SprintOrTracker && (
            <div className="md:ml-2 ml-0 items-center">
              <OrganizationSwitcher
                afterLeaveOrganizationUrl="/tracker/select-group"
                afterCreateOrganizationUrl={"/tracker/group/:id"}
                afterSelectOrganizationUrl={"/tracker/group/:id"}
                hidePersonal
              />
            </div>
          )}
        </ClerkLoaded>{" "}
      </div>
    </>
  );
};

export default NavbarRoutes;
