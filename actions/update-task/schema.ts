import { z } from "zod";

export const UpdateTask = z.object({
  sprintId: z.string(),
  description: z.optional(
    z
      .string({
        required_error: "Description is required",
        invalid_type_error: "Description is required",
      })
      .min(3, {
        message: "Description is too short",
      })
  ),
  title: z.optional(
    z
      .string({
        required_error: "title is required",
        invalid_type_error: "title is required",
      })
      .min(3, {
        message: "Title is too short",
      })
  ),
  id: z.string(),
});
