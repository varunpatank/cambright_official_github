import { z } from "zod";
import { Task } from "@prisma/client";
import { ActionState } from "@/lib/create-safe-action";
import { DeleteTask } from "./schema";

export type InputType = z.infer<typeof DeleteTask>;
export type ReturnType = ActionState<InputType, Task>;
