import { NextResponse } from "next/server"; // Use NextResponse from next/server (for the app directory)
import { db } from "@/lib/db"; // Your DB import
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  // Parse JSON from request body
  const { sprintId } = await req.json();

  const { userId, orgId } = auth();
  if (!userId || !orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!sprintId) {
    return NextResponse.json({ error: "Missing sprintId" }, { status: 400 });
  }

  try {
    // Fetch the sprint with its lists and tasks
    const sprint = await db.sprint.findUnique({
      where: { id: sprintId },
      include: {
        lists: {
          include: {
            tasks: true,
          },
        },
      },
    });

    if (!sprint) {
      return NextResponse.json({ error: "Sprint not found" }, { status: 404 });
    }

    // Create a new sprint (cloning the existing one)
    const newSprint = await db.sprint.create({
      data: {
        title: sprint.title,
        orgId, // Use the authenticated user's orgId
        imageId: sprint.imageId,
        imageThumbUrl: sprint.imageThumbUrl,
        imageFullUrl: sprint.imageFullUrl,
        imageUserName: sprint.imageUserName,
        imageLinkHTML: sprint.imageLinkHTML,
        isTemplate: false,
      },
    });

    // Copy lists and tasks to the new sprint
    for (const list of sprint.lists) {
      const newList = await db.list.create({
        data: {
          title: list.title,
          order: list.order,
          sprintId: newSprint.id,
        },
      });

      for (const task of list.tasks) {
        await db.task.create({
          data: {
            title: task.title,
            order: task.order,
            description: task.description,
            dueDate: task.dueDate,
            listId: newList.id,
          },
        });
      }
    }

    // Return the new sprintId
    return NextResponse.json({ sprintId: newSprint.id }, { status: 200 });
  } catch (error) {
    console.error("Error grabbing sprint:", error);
    return NextResponse.json(
      { error: "Failed to grab sprint" },
      { status: 500 }
    );
  }
}
