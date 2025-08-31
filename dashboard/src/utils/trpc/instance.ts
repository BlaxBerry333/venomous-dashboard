import { initTRPC } from "@trpc/server";
import type { TRPCContextGenerator } from "./context";

let trpcSingleton: ReturnType<typeof createTRPCInstance> | undefined;

function createTRPCInstance() {
  return initTRPC.context<TRPCContextGenerator>().create();
}

function init(): ReturnType<typeof createTRPCInstance> {
  if (!trpcSingleton) {
    trpcSingleton = createTRPCInstance();
  }
  return trpcSingleton;
}

export const trpc = init();
