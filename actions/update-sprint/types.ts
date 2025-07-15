import { z } from "zod";
import { Sprint } from "@prisma/client";
import { ActionState } from "@/lib/create-safe-action";
import { UpdateSprint } from "@/actions/update-sprint/schema";

export type InputType = z.infer<typeof UpdateSprint>;
export type ReturnType = ActionState<InputType, Sprint>;
