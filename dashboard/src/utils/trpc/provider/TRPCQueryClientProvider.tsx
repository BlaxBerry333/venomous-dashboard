"use client";

import React from "react";

import { QueryClient as TanstackQueryClient, QueryClientProvider as TanstackQueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools as TanstackQueryDevtools } from "@tanstack/react-query-devtools";

import { trpcClient } from "../client";
import { TRPCProvider } from "./TRPCProvider";

let tanstackQueryClientSingleton: TanstackQueryClient | undefined;

function createTanstackQueryClient(): TanstackQueryClient {
  return new TanstackQueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60, // 1 minute 内数据不会重新获取
        gcTime: 1000 * 60 * 2, // 2 minutes 后未使用的数据会被垃圾回收
        refetchOnWindowFocus: true, // 窗口获得焦点时重新获取数据
        refetchOnMount: false, // 组件挂载时重新获取数据
        refetchOnReconnect: false, // 网络重新连接时重新获取数据
        retry: false, // 失败后不重试
      },
    },
  });
}

function initQueryClient(): TanstackQueryClient {
  if (typeof window === "undefined") {
    return createTanstackQueryClient();
  }
  if (!tanstackQueryClientSingleton) {
    tanstackQueryClientSingleton = createTanstackQueryClient();
  }
  return tanstackQueryClientSingleton;
}

const tanstackQueryClient = initQueryClient();

const TRPCQueryClientProvider = React.memo<React.PropsWithChildren>(({ children }) => {
  return (
    <TanstackQueryClientProvider client={tanstackQueryClient}>
      {process.env.NODE_ENV !== "production" && <TanstackQueryDevtools initialIsOpen={false} />}
      <TRPCProvider trpcClient={trpcClient} queryClient={tanstackQueryClient}>
        {children}
      </TRPCProvider>
    </TanstackQueryClientProvider>
  );
});

TRPCQueryClientProvider.displayName = "TRPCQueryClientProvider";
export default TRPCQueryClientProvider;
