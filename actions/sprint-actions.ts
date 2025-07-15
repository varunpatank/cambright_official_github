// actions/sprint-actions.ts
import { db } from "@/lib/db";
import { Sprint } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

interface GrabSprintParams {
  sprintId: string;
  orgId: string;
  userId: string;
}
// actions/sprint-actions.ts
export async function grabSprint({
  sprintId,
  orgId,
  userId,
}: GrabSprintParams) {
  try {
    // Find the sprint template by its ID
    const sprintTemplate = await db.sprint.findUnique({
      where: { id: sprintId },
    });

    if (!sprintTemplate) {
      throw new Error("Sprint not found");
    }

    // Check if the sprint is a template and is not already in the user's org
    if (sprintTemplate.isTemplate && sprintTemplate.orgId !== orgId) {
      // Create a copy of the sprint under the user's organization
      const copiedSprint = await db.sprint.create({
        data: {
          title: sprintTemplate.title,
          orgId: orgId, // Assign to the user's org
          imageId: sprintTemplate.imageId,
          imageThumbUrl: sprintTemplate.imageThumbUrl,
          imageFullUrl: sprintTemplate.imageFullUrl,
          imageLinkHTML: sprintTemplate.imageLinkHTML,
          imageUserName: sprintTemplate.imageUserName,
          isTemplate: false, // Make it a regular sprint, not a template anymore
        },
      });

      // Return the result
      return { success: true, sprintId: copiedSprint.id };
    }

    return {
      success: false,
      error: "Sprint is not a template or already in your org",
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: error };
  }
}
