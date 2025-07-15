import { z } from "zod";

export const DeleteSprint = z.object({
  id: z.string(),
});
