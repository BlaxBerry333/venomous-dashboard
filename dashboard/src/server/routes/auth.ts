import { TRPCError } from "@trpc/server";

import { mapHttpStatusToTRPCCode, removeAccessCookie, setAccessCookie } from "@/server/helpers";
import { AUTH_FETCHERS } from "@/utils/api";
import { trpc } from "@/utils/trpc/index.server";
import { AUTH_SIGNIN_SCHEMA, AUTH_SIGNUP_SCHEMA } from "@/utils/validation";

export const AuthProcedures = {
  /**
   * Signup
   */
  signup: trpc.procedure.input(AUTH_SIGNUP_SCHEMA).mutation(async ({ input }) => {
    try {
      const {
        response,
        data: { data, success, error },
      } = await AUTH_FETCHERS.SIGNUP(input);

      if (!response.ok || !success) {
        throw new TRPCError({
          code: mapHttpStatusToTRPCCode(response.status),
          cause: {
            errorCode: error?.code,
            errorMessage: error?.message,
            statusCode: response.status,
          },
        });
      }

      const token = data?.token;
      if (!token) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "SIGNUP_FAILED",
        });
      }

      await setAccessCookie(token);
      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `${(error as Error).message}`,
      });
    }
  }),

  /**
   * Signin
   */
  signin: trpc.procedure.input(AUTH_SIGNIN_SCHEMA).mutation(async ({ input }) => {
    try {
      const {
        response,
        data: { data, success, error },
      } = await AUTH_FETCHERS.SIGNIN(input);

      if (!response.ok || !success) {
        throw new TRPCError({
          code: mapHttpStatusToTRPCCode(response.status),
          cause: {
            errorCode: error?.code,
            errorMessage: error?.message,
            statusCode: response.status,
          },
        });
      }

      const token = data?.token;
      if (!token) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "SIGNIN_FAILED",
        });
      }

      await setAccessCookie(token);
      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `${(error as Error).message}`,
      });
    }
  }),

  /**
   * Logout
   */
  logout: trpc.procedure.mutation(async () => {
    try {
      await removeAccessCookie();
      return undefined;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: String((error as Error).message),
      });
    }
  }),
} as const;
