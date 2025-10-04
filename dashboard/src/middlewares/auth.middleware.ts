import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ROUTER_PATHS } from "@/client/routes";
import { COOKIE_NAME } from "@/server/helpers";

const PROTECTED_PATHS = Object.values(ROUTER_PATHS.DASHBOARD);

export function authMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const i18nLocale = pathname.split("/")[1];
  const basePath = `/${i18nLocale}` as const;
  const authSigninPath = `${basePath}${ROUTER_PATHS.AUTH.SIGNIN}` as const;
  const dashboardRootPath = `${basePath}${ROUTER_PATHS.DASHBOARD.NOTES_LIST}` as const;

  const isAuthenticated = request.cookies.has(COOKIE_NAME.ACCESS_TOKEN);
  const isAccessingRootPath = pathname === basePath;
  const isAccessingProtectedPath = PROTECTED_PATHS.some((path) => pathname.startsWith(`${basePath}${path}`));
  const isAccessingSigninPath = pathname === authSigninPath;

  if (!isAuthenticated && isAccessingRootPath) {
    return NextResponse.redirect(new URL(authSigninPath, request.url));
  }

  if (!isAuthenticated && isAccessingProtectedPath) {
    const targetURL = new URL(authSigninPath, request.url);
    targetURL.searchParams.set("redirect", pathname);
    return NextResponse.redirect(targetURL);
  }

  if (isAuthenticated && (isAccessingSigninPath || isAccessingRootPath)) {
    return NextResponse.redirect(new URL(dashboardRootPath, request.url));
  }

  return NextResponse.next();
}
