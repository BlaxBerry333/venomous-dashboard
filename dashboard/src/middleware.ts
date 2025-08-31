import { NextResponse, type NextRequest } from "next/server";

import { authMiddleware } from "./middlewares/auth.middleware";
import { i18nLocaleMiddleware } from "./middlewares/i18n.middleware";

// Create the middleware pipeline
const middlewareStacks: Array<(request: NextRequest) => NextResponse | void> = [
  // 1. handling the locale appending in URL and redirect
  i18nLocaleMiddleware,
  // 3. handling authentication redirects
  authMiddleware,
];

export function middleware(request: NextRequest) {
  for (const mw of middlewareStacks) {
    const response = mw(request);
    if (response) {
      return response;
    }
  }
  return NextResponse.next();
}

export const config = {
  // Define which paths will trigger this middleware.
  // Exclude: API routes、Next.js internal files、public static assets
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map|ttf|woff|woff2|eot|mp4|webm|mp3|wav|pdf|xml|json)$).*)",
  ],
};
