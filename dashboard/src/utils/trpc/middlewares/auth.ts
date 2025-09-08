import { TRPCError } from "@trpc/server";

import { getAccessCookie } from "@/server/helpers";
import { API_ENDPOINTS } from "@/utils/api";
import { i18n } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { trpc } from "../instance";

const TRPCAuthMiddleware = () => {
  return trpc.middleware(async ({ ctx, next }) => {
    const token = await getAccessCookie();
    const dictionary = await getDictionary(ctx.i18nLocale, i18n.namespaces);

    if (!token?.value) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: dictionary.service_auth.apiResults.TOKEN_NOT_FOUND,
      });
    }

    const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.AUTH.TOKEN_VERIFY, {
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

    const userData = await response.json();
    return next({
      ctx: { ...ctx, user: userData },
    });
  });
};

export const TRPCAuthProtectedProcedure = trpc.procedure.use(TRPCAuthMiddleware());
