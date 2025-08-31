import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ROUTER_PATHS } from "@/client/routes";
import { COOKIE_NAME } from "@/server/utils";

const PROTECTED_PATHS = [ROUTER_PATHS.DASHBOARD.ROOT] as const;
const AUTH_PATHS = [ROUTER_PATHS.AUTH.SIGNIN] as const;

export function authMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const i18nLocale = pathname.split("/")[1];
  const basePath = `/${i18nLocale}` as const;
  const authSigninPath = `${basePath}${ROUTER_PATHS.AUTH.SIGNIN}` as const;
  const dashboardRootPath = `${basePath}${ROUTER_PATHS.DASHBOARD.MEDIA}` as const;

  const isAuthenticated = request.cookies.has(COOKIE_NAME.ACCESS_TOKEN);
  const isAccessingRootPath = pathname === basePath;
  const isAccessingProtectedPath = PROTECTED_PATHS.some((path) => pathname.startsWith(`${basePath}${path}`));
  const isAccessingAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(`${basePath}${path}`));

  if (!isAuthenticated && isAccessingRootPath) {
    return NextResponse.redirect(new URL(authSigninPath, request.url));
  }

  if (!isAuthenticated && isAccessingProtectedPath) {
    const targetURL = new URL(authSigninPath, request.url);
    targetURL.searchParams.set("redirect", pathname);
    return NextResponse.redirect(targetURL);
  }

  if (isAuthenticated && (isAccessingAuthPath || isAccessingRootPath)) {
    return NextResponse.redirect(new URL(dashboardRootPath, request.url));
  }

  return NextResponse.next();
}
