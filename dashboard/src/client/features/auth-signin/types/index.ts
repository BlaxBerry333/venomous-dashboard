import type { z } from "zod";
import type { getAuthSigninFormSchema } from "../schemas";

export type IAuthSigninFormSchema = z.infer<ReturnType<typeof getAuthSigninFormSchema>>;
