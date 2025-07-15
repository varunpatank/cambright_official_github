import React from "react";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { TrackerNavbar } from "../../_components/tracker-navbar";
import { SprintNavbar } from "./_components/sprint-navbar";

interface SprintIdLayoutProps {
  children: React.ReactNode;
  params: {
    sprintId: string;
  };
}
export async function generateMetadata({
  params,
}: {
  params: { sprintId: string };
}) {
  const { orgId } = auth();
  if (!orgId) {
    return {
      title: "Sprint",
    };
  }
  const sprint = await db.sprint.findUnique({
    where: { id: params.sprintId, orgId },
  });
  return {
    title: sprint?.title + " | Cambright " || "Sprint",
  };
}
const SprintIdLayout = async ({ children, params }: SprintIdLayoutProps) => {
  const { orgId } = auth();
  if (!orgId) redirect("/tracker/select-group");
  const sprint = await db.sprint.findUnique({
    where: { id: params.sprintId, orgId },
  });
  if (!sprint) redirect("/tracker/select-group");

  return (
    <div
      className="relative h-full bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: `url(${sprint.imageFullUrl})` }}
    >
      <div className="absolute inset-0 bg-black/10" />
      <SprintNavbar data={sprint} />
      <main className="relative pt-28 h-full">{children}</main>
    </div>
  );
};

export default SprintIdLayout;
