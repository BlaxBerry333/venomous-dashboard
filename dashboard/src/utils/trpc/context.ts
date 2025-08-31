import type { NextRequest, NextResponse } from "next/server";

export type TRPCContextGenerator = (request: NextRequest, response: NextResponse) => Promise<{ request: NextRequest; response: NextResponse }>;

export const createTRPCContext: TRPCContextGenerator = async (request, response) => {
  return {
    request,
    response,
  };
};
