import { AuthAPI } from "@/server/routes/auth";
import { trpc } from "./instance";

export const trpcAppRouter = trpc.router({
  auth: trpc.router(AuthAPI),
});

export type TRPCAppRouter = typeof trpcAppRouter;
