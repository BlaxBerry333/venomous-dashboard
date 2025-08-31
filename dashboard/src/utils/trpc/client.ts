"use client";

import { createTRPCClient as createClient, httpBatchLink } from "@trpc/client";
import type { TRPCAppRouter } from "./router";

let trpcClientSingleton: ReturnType<typeof createTRPCClient> | undefined;

function createTRPCClient() {
  return createClient<TRPCAppRouter>({
    links: [
      httpBatchLink({
        url: `${process.env.NEXT_PUBLIC_DASHBOARD}/api/trpc`,
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
