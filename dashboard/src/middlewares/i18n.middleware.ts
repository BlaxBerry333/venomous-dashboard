import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { i18n } from "@/utils/i18n/config";

export function i18nLocaleMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the pathname already has a locale prefix
  const pathnameHasLocale = i18n.locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`);

  // Do nothing if the locale is already exist in the path
  if (pathnameHasLocale) {
    return;
  }

  // Redirect to the default locale if no locale is present
  const url = request.nextUrl.clone();
  url.pathname = `/${i18n.defaultLocale}${pathname}`;
  return NextResponse.redirect(url);
}
