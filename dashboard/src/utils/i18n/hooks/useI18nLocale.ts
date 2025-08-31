"use client";

import React from "react";

import { useParams, usePathname } from "next/navigation";
import { I18N_LOCALES_OPTIONS } from "../constants";
import type { I18nLocale } from "../types";

export default function useI18nLocale() {
  const pathname = usePathname();
  const { locale: currentLocale } = useParams<{ locale: I18nLocale }>();

  const currentLocalOption = React.useMemo(() => I18N_LOCALES_OPTIONS.find((option) => option.value === currentLocale), [currentLocale]);

  const getTargetLocaleOption = React.useCallback((targetLocale: I18nLocale) => I18N_LOCALES_OPTIONS.find((option) => option.value === targetLocale), []);

  const getReplacedPathnameWithTargetLocale = React.useCallback(
    (targetLocale: I18nLocale) => pathname.replace(`/${currentLocale}`, `/${targetLocale}`),
    [pathname, currentLocale],
  );

  return {
    currentLocale,
    currentLocalOption,
    getTargetLocaleOption,
    getReplacedPathnameWithTargetLocale,
  };
}
