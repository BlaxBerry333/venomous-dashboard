import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { removeAccessCookie, setAccessCookie } from "@/server/utils";
import { trpc } from "@/utils/trpc/index.server";

const SIGNIN_SCHEMA = z.object({ email: z.string(), password: z.string() });

export const AuthAPI = {
  signup: trpc.procedure.input(SIGNIN_SCHEMA).mutation(async ({ input }) => {
    try {
      await setAccessCookie("xxxxxxxxxx");
      return input;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR", // 500
        message: `Failed to signup. ${(error as Error).message}`,
      });
    }
  }),

  signin: trpc.procedure.input(SIGNIN_SCHEMA).mutation(async ({ input }) => {
    try {
      await setAccessCookie("xxxxxxxxxx");
      return input;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR", // 500
        message: `Failed to signup. ${(error as Error).message}`,
      });
    }
  }),

  logout: trpc.procedure.mutation(async () => {
    try {
      await removeAccessCookie();
      return undefined;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR", // 500
        message: `Failed to signup. ${(error as Error).message}`,
      });
    }
  }),

  // accessToken: trpc.procedure.mutation(async ({ ctx }) => {}),
  // refreshToken: trpc.procedure.mutation(async ({ ctx }) => {}),
} as const;
