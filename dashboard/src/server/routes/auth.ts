import { TRPCError } from "@trpc/server";

import { getAccessCookie, mapHttpStatusToTRPCCode, removeAccessCookie, setAccessCookie } from "@/server/helpers";
import { API_ENDPOINTS, type TApiResponseOfAuthSignin, type TApiResponseOfAuthSignup, type TApiResponseOfAuthTokenRefresh } from "@/utils/api";
import { trpc } from "@/utils/trpc/index.server";
import { AUTH_SIGNIN_SCHEMA, AUTH_SIGNUP_SCHEMA } from "@/utils/validation";

export const AuthAPI = {
  /**
   * Signup
   */
  signup: trpc.procedure.input(AUTH_SIGNUP_SCHEMA).mutation(async ({ input }) => {
    try {
      const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.AUTH.SIGNUP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const apiResponse = (await response.json()) as TApiResponseOfAuthSignup;
      if (!response.ok || !apiResponse.success) {
        throw new TRPCError({
          code: mapHttpStatusToTRPCCode(response.status),
          cause: {
            errorCode: apiResponse.error?.code,
            errorMessage: apiResponse.error?.message,
            statusCode: response.status,
          },
        });
      }

      const token = apiResponse.data?.token;
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
      const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.AUTH.SIGNIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const apiResponse = (await response.json()) as TApiResponseOfAuthSignin;
      if (!response.ok || !apiResponse.success) {
        throw new TRPCError({
          code: mapHttpStatusToTRPCCode(response.status),
          cause: {
            errorCode: apiResponse.error?.code,
            errorMessage: apiResponse.error?.message,
            statusCode: response.status,
          },
        });
      }

      const token = apiResponse.data?.token;
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

  /**
   * Refresh access token
   */
  refreshToken: trpc.procedure.mutation(async () => {
    try {
      const token = await getAccessCookie();
      if (!token?.value) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "TOKEN_NOT_FOUND",
        });
      }

      const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.AUTH.REFRESH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.value }),
      });

      const apiResponse = (await response.json()) as TApiResponseOfAuthTokenRefresh;
      if (!response.ok || !apiResponse.success) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          cause: {
            errorCode: apiResponse.error?.code,
            errorMessage: apiResponse.error?.message,
            statusCode: response.status,
          },
        });
      }

      const newToken = apiResponse.data?.token;
      if (!newToken) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "TOKEN_REFRESH_FAILED",
        });
      }

      await setAccessCookie(newToken);
      return { success: true, token: newToken };
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
