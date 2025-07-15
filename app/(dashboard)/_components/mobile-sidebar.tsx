// v.0.0.01 salah

"use client";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import Sidebar from "./sidebar";
import { useState } from "react";

const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <div>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger
          className="button relative inline-flex items-center justify-center h-11 transition-colors hover:text-color-1 px-3 text-n-1 ml-auto md:hidden"
          onClick={handleOpen}
        >
          <MenuIcon />
        </SheetTrigger>
        <SheetContent side={"left"} className="p-0 border-n-6 bg-n-8/90">
          <SheetTitle>
            <VisuallyHidden.Root>sidebar</VisuallyHidden.Root>
          </SheetTitle>
          <SheetDescription>
            <VisuallyHidden.Root>HIDDEN DESC</VisuallyHidden.Root>
          </SheetDescription>
          <Sidebar onClose={handleClose} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileSidebar;
