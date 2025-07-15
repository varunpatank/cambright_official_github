"use server";
import { InputType, ReturnType } from "./types";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { CreateSprint } from "./schema";
import { auth } from "@clerk/nextjs/server";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = auth();
  if (!userId || !orgId) {
    return {
      error: "Unauthorized",
    };
  }

  const { title, image, template } = data;
  const [imageId, imageThumbUrl, imageFullUrl, imageLinkHTML, imageUserName] =
    image.split("|");
  if (
    !imageId ||
    !imageThumbUrl ||
    !imageFullUrl ||
    !imageLinkHTML ||
    !imageUserName
  ) {
    return {
      error: "Missing Fields. Failed to create sprint",
    };
  }
  let sprint;
  try {
    sprint = await db.sprint.create({
      data: {
        title,
        orgId,
        imageId,
        imageThumbUrl,
        imageFullUrl,
        imageUserName,
        imageLinkHTML,
        isTemplate: Boolean(template), // Store the template flag
      },
    });
  } catch (err) {
    if (err instanceof Error) {
      return {
        error: `Failed to create: ${err.message}`,
      };
    }
  }
  if (sprint != undefined) revalidatePath(`/tracker/sprint/${sprint.id}`);

  return {
    data: sprint,
  };
};
export const createSprintz = createSafeAction(CreateSprint, handler);
