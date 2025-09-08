import { TRPCError } from "@trpc/server";

import { getAccessCookie, removeAccessCookie, setAccessCookie } from "@/server/helpers";
import { API_ENDPOINTS } from "@/utils/api";
import { getDictionary, i18n } from "@/utils/i18n/index.serve";
import { trpc } from "@/utils/trpc/index.server";
import { AUTH_SIGNIN_SCHEMA } from "@/utils/validation";

export const AuthAPI = {
  /**
   * Signup
   */
  signup: trpc.procedure.input(AUTH_SIGNIN_SCHEMA).mutation(async ({ input, ctx }) => {
    try {
      const dictionary = await getDictionary(ctx.i18nLocale, i18n.namespaces);

      const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.AUTH.SIGNUP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: dictionary.service_auth.apiResults.SIGNUP_FAILED,
        });
      }

      const data = await response.json();
      const token = data.token as string;

      if (!token) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: dictionary.service_auth.apiResults.SIGNUP_FAILED,
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
  signin: trpc.procedure.input(AUTH_SIGNIN_SCHEMA).mutation(async ({ input, ctx }) => {
    try {
      const dictionary = await getDictionary(ctx.i18nLocale, i18n.namespaces);

      const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.AUTH.SIGNIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: dictionary.service_auth.apiResults.SIGNIN_FAILED,
        });
      }

      const data = await response.json();
      const token = data.token as string;

      if (!token) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: dictionary.service_auth.apiResults.SIGNIN_FAILED,
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
        code: "INTERNAL_SERVER_ERROR", // 500
        message: `${(error as Error).message}`,
      });
    }
  }),

  /**
   * Get access token info
   */
  accessToken: trpc.procedure.query(async ({ ctx }) => {
    try {
      const dictionary = await getDictionary(ctx.i18nLocale, i18n.namespaces);
      const token = await getAccessCookie();

      if (!token?.value) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: dictionary.service_auth.apiResults.TOKEN_NOT_FOUND,
        });
      }

      const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.AUTH.TOKEN_INFO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.value }),
      });

      if (!response.ok) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: dictionary.service_auth.apiResults.TOKEN_INVALID,
        });
      }

      const tokenInfo = await response.json();
      return tokenInfo;
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
   * Refresh access token
   */
  refreshToken: trpc.procedure.mutation(async ({ ctx }) => {
    try {
      const dictionary = await getDictionary(ctx.i18nLocale, i18n.namespaces);
      const token = await getAccessCookie();

      if (!token?.value) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: dictionary.service_auth.apiResults.TOKEN_NOT_FOUND,
        });
      }

      const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.AUTH.REFRESH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.value }),
      });

      if (!response.ok) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: dictionary.service_auth.apiResults.TOKEN_REFRESH_FAILED,
        });
      }

      const data = await response.json();
      const newToken = data.token as string;

      if (!newToken) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: dictionary.service_auth.apiResults.TOKEN_REFRESH_FAILED,
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
        message: `${(error as Error).message}`,
      });
    }
  }),
} as const;
