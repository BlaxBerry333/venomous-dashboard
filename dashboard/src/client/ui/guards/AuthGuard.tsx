"use client";

import { useRouter } from "next/navigation";
import React from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Backdrop, notify, ProgressBar } from "venomous-ui-react/components";

import { ROUTER_PATHS } from "@/client/routes";
import type { TUserProfile } from "@/types";
import { useI18nDictionary, useI18nLocale } from "@/utils/i18n/index.client";
import { useTRPC } from "@/utils/trpc/index.client";
import { extractTRPCErrorInfo } from "@/utils/trpc/types";

export type TAuthGuardContext = {
  userData: TUserProfile | undefined;
  logout: () => Promise<{ success: boolean }>;
};

export const AuthGuardContext = React.createContext<TAuthGuardContext | null>(null);

export const useAuthGuardContext = (): TAuthGuardContext => {
  const ctx = React.useContext(AuthGuardContext);
  if (!ctx) {
    throw new Error("useAuthGuardContext must be used within AuthGuard");
  }
  return ctx;
};

const AuthGuard = React.memo<React.PropsWithChildren>(({ children }) => {
  const router = useRouter();

  const dictionary = useI18nDictionary();
  const { currentLocale } = useI18nLocale();

  const trpc = useTRPC();

  const queryOfUser = useQuery(trpc.user.getProfile.queryOptions());
  const { data, isError, isLoading } = queryOfUser;

  const mutationOfLogout = useMutation(
    trpc.auth.logout.mutationOptions({
      onSuccess: () => {
        notify({
          type: "SUCCESS",
          title: dictionary.service_auth.API_RESULTS.LOGOUT_SUCCESS,
        });
        router.replace(`/${currentLocale}${ROUTER_PATHS.AUTH.SIGNIN}`);
      },
      onError: (error) => {
        const { errorCode, errorMessage } = extractTRPCErrorInfo(error);
        notify({
          type: "ERROR",
          title: dictionary.service_auth.apiResults?.[errorCode],
          description: errorMessage,
        });
      },
    }),
  );

  // Logout
  const logout = React.useCallback(async () => {
    if (mutationOfLogout.isPending) {
      return { success: false };
    }
    try {
      await mutationOfLogout.mutateAsync();
      return { success: true };
    } catch {
      return { success: false };
    }
  }, [mutationOfLogout]);

  // AuthGuard ctx
  const contextValue = React.useMemo<TAuthGuardContext>(() => {
    return { userData: data, logout };
  }, [data, logout]);

  // Handle authentication failure
  React.useEffect(() => {
    if (isError && !isLoading) {
      // Only call logout if there's an actual error (e.g., 401, 403)
      // This means the cookie exists but is invalid/expired
      // Don't call logout if data is simply undefined (no cookie case)
      void logout();
    }
  }, [isError, isLoading, logout]);

  if (isLoading || !data) {
    return (
      <Backdrop open>
        <ProgressBar animated style={{ height: 8, maxWidth: 350 }} />
      </Backdrop>
    );
  }

  return <AuthGuardContext.Provider value={contextValue}>{children}</AuthGuardContext.Provider>;
});

AuthGuard.displayName = "AuthGuard";
export default AuthGuard;
