// @/actions/get-subjects.ts
import { db } from "@/lib/db";

export async function getSubjects() {
  try {
    const subjects = await db.subject.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return subjects;
  } catch (error) {
    console.error("Failed to fetch subjects:", error);
    throw new Error("Failed to fetch subjects");
  }
}
