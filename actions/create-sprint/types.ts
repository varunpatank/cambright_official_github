import { z } from "zod";
import { Sprint } from "@prisma/client";
import { ActionState } from "@/lib/create-safe-action";
import { CreateSprint } from "./schema";
export type InputType = z.infer<typeof CreateSprint>;
export type ReturnType = ActionState<InputType, Sprint>;
