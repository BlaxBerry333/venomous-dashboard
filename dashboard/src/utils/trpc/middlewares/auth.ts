import { TRPCError } from "@trpc/server";

import { getAccessCookie, setAccessCookie } from "@/server/helpers";
import { AUTH_FETCHERS } from "@/utils/api";
import { trpc } from "../instance";

const authProtectedMiddleware = trpc.middleware(async ({ ctx, next }) => {
  try {
    const token = await getAccessCookie();
    if (!token?.value) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        cause: {
          errorCode: "TOKEN_NOT_FOUND",
          errorMessage: "TOKEN_NOT_FOUND",
          statusCode: 401,
        },
      });
    }

    const {
      response,
      data: { success },
    } = await AUTH_FETCHERS.TOKEN_VERIFY({ token: token.value });

    if (!response.ok || !success) {
      const {
        response,
        data: { data, success, error },
      } = await AUTH_FETCHERS.TOKEN_REFRESH({ token: token.value });

      if (!response.ok || !success || !data?.token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          cause: {
            errorCode: error?.code,
            errorMessage: error?.message,
            statusCode: response.status,
          },
        });
      }

      const newToken = data?.token;
      await setAccessCookie(newToken);
      return next({
        ctx: {
          ...ctx,
          token: newToken,
        },
      });
    }

    return next({
      ctx: {
        ...ctx,
        token: token.value,
      },
    });
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: String((error as Error).message),
    });
  }
});

export const TRPCAuthProtectedProcedure = trpc.procedure.use(authProtectedMiddleware);
