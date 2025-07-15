import { z } from "zod";

export const CreateList = z.object({
  title: z
    .string({
      required_error: "title is required",
      invalid_type_error: "title is required",
    })
    .min(2, {
      message: "Title is too short",
    }),
  sprintId: z.string(),
});
