"use client";

import { i18n } from "@/utils/i18n/index.client";
import { createTRPCClient as createClient, httpBatchLink } from "@trpc/client";
import type { Ti18nLocale } from "../i18n/index.types";
import type { TRPCAppRouter } from "./router";

let trpcClientSingleton: ReturnType<typeof createTRPCClient> | undefined;

function createTRPCClient() {
  return createClient<TRPCAppRouter>({
    links: [
      httpBatchLink({
        url: `${process.env.NEXT_PUBLIC_ENDPOINT_DASHBOARD}/api/trpc`,
        headers() {
          if (typeof window !== "undefined") {
            const locale = (window.location.pathname.split("/")[1] as Ti18nLocale) || i18n.defaultLocale;
            return { "x-locale": locale };
          }
          return { "x-locale": i18n.defaultLocale };
        },
      }),
    ],
  });
}

function initClient(): ReturnType<typeof createTRPCClient> {
  if (typeof window === "undefined") {
    return createTRPCClient();
  }
  if (!trpcClientSingleton) {
    trpcClientSingleton = createTRPCClient();
  }
  return trpcClientSingleton;
}

export const trpcClient = initClient();
