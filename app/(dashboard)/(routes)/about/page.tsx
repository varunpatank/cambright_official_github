import { TutorRole } from "@prisma/client";
import { db } from "@/lib/db";
import { getUsersFirstNames } from "@/lib/clerkername";
import { getDatabaseUsernames } from "@/lib/get-database-username";
import { defaultIds } from "../users";
import AboutClient from "./about-client";
import type { User } from "./team-data";

const tutorRoleLabels: Record<TutorRole, string> = {
  TUTOR: "Tutor",
  SENIOR_TUTOR: "Senior Tutor",
  ADMIN_TUTOR: "Admin Tutor",
};

async function getActiveTutors(): Promise<User[]> {
  const tutorRecords = await db.tutor.findMany({
    where: { isActive: true },
    select: {
      userId: true,
      role: true,
    },
    orderBy: [
      { role: "asc" },
      { createdAt: "asc" },
    ],
  });

  const fallbackRecords = defaultIds.tutorIds.map((userId) => ({
    userId,
    role: TutorRole.TUTOR,
  }));

  const sourceRecords = tutorRecords.length > 0 ? tutorRecords : fallbackRecords;
  const userIds = sourceRecords.map((record) => record.userId);
  const [clerkUsers, databaseNames] = await Promise.all([
    getUsersFirstNames(userIds),
    getDatabaseUsernames(userIds),
  ]);

  return sourceRecords.map((record) => {
    const clerkUser = clerkUsers[record.userId];
    const fallbackName = databaseNames[record.userId] ?? record.userId.slice(0, 12);
    const roleLabel = tutorRoleLabels[record.role];

    return {
      name: clerkUser?.fullname || clerkUser?.username || fallbackName,
      role: roleLabel,
      bio: "",
      tags: roleLabel === "Tutor" ? ["Tutor"] : ["Tutor", roleLabel],
      socialLinks: {},
      avatar: clerkUser?.imageUrl || "/user1.png",
    };
  });
}

export default async function AboutPage() {
  const activeTutors = await getActiveTutors();

  return <AboutClient activeTutors={activeTutors} />;
}
