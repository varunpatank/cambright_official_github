import { z } from "zod";

export const DeleteTask = z.object({
  id: z.string(),
  sprintId: z.string(),
});
