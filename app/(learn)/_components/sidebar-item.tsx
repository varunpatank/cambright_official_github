"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LearnButton } from "@/components/ui/learnbutton";

type Props = {
  label: string;
  iconSrc: string;
  href: string;
};

export const SidebarItem = ({ label, iconSrc, href }: Props) => {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <LearnButton
      variant={active ? "sidebaroutline" : "sidebar"}
      className="justify-start h-[52px]"
      asChild
    >
      <Link href={href}>
        <Image
          src={iconSrc}
          alt={label}
          className="mr-5"
          height={32}
          width={32}
        />
        {label}
      </Link>
    </LearnButton>
  );
};
