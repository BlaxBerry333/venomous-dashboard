import { TRPCError } from "@trpc/server";

import { getAccessCookie } from "@/server/helpers";
import { API_ENDPOINTS, type TApiResponseOfAuthTokenInfo } from "@/utils/api";
import { TRPCAuthProtectedProcedure } from "@/utils/trpc/index.server";

export const UserAPI = {
  getUser: TRPCAuthProtectedProcedure.query(async () => {
    const token = await getAccessCookie();
    try {
      if (!token?.value) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "TOKEN_NOT_FOUND",
        });
      }

      const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.AUTH.TOKEN_INFO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.value }),
      });

      const apiResponse = (await response.json()) as TApiResponseOfAuthTokenInfo;
      if (!response.ok || !apiResponse.success) {
        throw new TRPCError({
          code: "NOT_FOUND",
          cause: {
            errorCode: apiResponse.error?.code,
            errorMessage: apiResponse.error?.message,
            statusCode: response.status,
          },
        });
      }

      return apiResponse.data;
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
