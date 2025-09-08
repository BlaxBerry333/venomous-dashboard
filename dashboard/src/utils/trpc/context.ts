import type { NextRequest, NextResponse } from "next/server";

import type { Ti18nLocale } from "../i18n/index.types";

type TRPCContext = {
  request: NextRequest;
  response: NextResponse;
  i18nLocale: Ti18nLocale;
};

export const createTRPCContext = async (request: NextRequest, response: NextResponse): Promise<TRPCContext> => {
  const i18nLocale = request.headers.get("x-locale") as Ti18nLocale;

  return {
    request,
    response,
    i18nLocale,
  };
};

export type TRPCContextGenerator = typeof createTRPCContext;
