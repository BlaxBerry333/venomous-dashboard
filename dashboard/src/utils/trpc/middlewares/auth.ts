import { TRPCError } from "@trpc/server";

import { getAccessCookie } from "@/server/helpers";
import { API_ENDPOINTS, type TApiResponseOfAuthTokenVerify } from "@/utils/api";
import { trpc } from "../instance";

const authMiddleware = trpc.middleware(async ({ ctx, next }) => {
  const token = await getAccessCookie();
  if (!token?.value) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "TOKEN_NOT_FOUND",
    });
  }

  // Verify token with auth service
  const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.AUTH.TOKEN_VERIFY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: token.value }),
  });

  const verifyResponse = (await response.json()) as TApiResponseOfAuthTokenVerify;
  if (!response.ok || !verifyResponse.success) {
    if (response.status === 401) {
      try {
        const refreshResponse = await fetch(API_ENDPOINTS.API_GATEWAY_URL.AUTH.REFRESH, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: token.value }),
        });

        if (refreshResponse.ok) {
          // Token refresh succeeded, but we need to implement cookie update
          // For now, we'll proceed with the original token verification failure
          // TODO: Implement automatic token refresh and cookie update
        }
      } catch {
        // Refresh failed, proceed with original error
      }
    }

    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "TOKEN_INVALID",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: verifyResponse.data,
    },
  });
});

export const TRPCAuthProtectedProcedure = trpc.procedure.use(authMiddleware);
