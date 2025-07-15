import React from "react";
import { Sprint } from "@prisma/client";
import { SprintTitleForm } from "./sprint-title-form";
import { SprintOptions } from "./sprint-options";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface SprintNavbarProps {
  data: Sprint;
}
export const SprintNavbar = async ({ data }: SprintNavbarProps) => {
  const { orgId } = auth();
  if (!orgId) redirect("/select-group");

  return (
    <div className="w-full h-14 z-[40] bg-black/50 fixed top-18 flex items-center px-6 gap-x-4 text-white">
      <Link href={`/tracker/group/${orgId}`}>
        <ArrowLeft className="text-muted-foreground hover:text-white transition-all" />
      </Link>
      <SprintTitleForm data={data} />
      <div className="ml-auto ">
        <SprintOptions id={data.id} />
      </div>
    </div>
  );
};
