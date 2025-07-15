import { z } from "zod";
import { Sprint } from "@prisma/client";
import { ActionState } from "@/lib/create-safe-action";
import { DeleteSprint } from "./schema";

export type InputType = z.infer<typeof DeleteSprint>;
export type ReturnType = ActionState<InputType, Sprint>;
