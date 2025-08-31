import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { NextRequest, NextResponse } from "next/server";

import { createTRPCContext, trpcAppRouter } from "@/utils/trpc/index.server";

const handler = (request: NextRequest, response: NextResponse) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: trpcAppRouter,
    createContext: () => createTRPCContext(request, response),
  });
};

export { handler as GET, handler as POST };
