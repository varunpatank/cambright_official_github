"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheetcustom";
import { useMobileSidebar } from "@/hooks/use-mobile-sidebar";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import TrackerSidebar from "../group/[groupId]/_components/TrackerSidebar";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/app/(dashboard)/_components/logo";
import Link from "next/link";

export const MobileSidebar = () => {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const onOpen = useMobileSidebar((state) => state.onOpen);
  const onClose = useMobileSidebar((state) => state.onClose);
  const isOpen = useMobileSidebar((state) => state.isOpen);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);
  if (!isMounted) {
    return null;
  }
  return (
    <>
      <Button
        onClick={onOpen}
        className="block md:hidden bg-transparent hover:bg-transparent"
      >
        <Menu className="h-6 w-6" />
      </Button>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="p-2 pt-10 border-n-6 bg-n-7">
          {" "}
          <SheetTitle>
            <VisuallyHidden.Root>sidebar</VisuallyHidden.Root>
          </SheetTitle>
          <SheetDescription>
            <VisuallyHidden.Root>HIDDEN DESC</VisuallyHidden.Root>
          </SheetDescription>
          <Link href={"/"}>
            <Logo />
          </Link>
          <TrackerSidebar storageKey="t-sidebar-mobile-state" />
        </SheetContent>
      </Sheet>
    </>
  );
};
