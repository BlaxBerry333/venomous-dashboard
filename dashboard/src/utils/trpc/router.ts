import { AuthProcedures } from "@/server/routes/auth";
import { UserProcedures } from "@/server/routes/user";
import { trpc } from "./instance";

export const trpcAppRouter = trpc.router({
  auth: trpc.router(AuthProcedures),
  user: trpc.router(UserProcedures),
});

export type TRPCAppRouter = typeof trpcAppRouter;
