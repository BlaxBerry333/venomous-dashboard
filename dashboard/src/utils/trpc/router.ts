import { AuthProcedures } from "@/server/routes/auth";
import { NotesProcedures } from "@/server/routes/notes";
import { UserProcedures } from "@/server/routes/user";
import { trpc } from "./instance";

export const trpcAppRouter = trpc.router({
  auth: trpc.router(AuthProcedures),
  user: trpc.router(UserProcedures),
  notes: trpc.router(NotesProcedures),
});

export type TRPCAppRouter = typeof trpcAppRouter;
