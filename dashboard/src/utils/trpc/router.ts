import { AuthAPI } from "@/server/routes/auth";
import { UserAPI } from "@/server/routes/user";
import { trpc } from "./instance";

export const trpcAppRouter = trpc.router({
  auth: trpc.router(AuthAPI),
  user: trpc.router(UserAPI),
});

export type TRPCAppRouter = typeof trpcAppRouter;
