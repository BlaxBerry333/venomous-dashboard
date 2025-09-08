"use client";

import { useParams, usePathname } from "next/navigation";
import React from "react";

import { I18N_LOCALES_OPTIONS } from "../constants";
import type { Ti18nLocale } from "../index.types";

export default function useI18nLocale() {
  const pathname = usePathname();
  const { locale: currentLocale } = useParams<{ locale: Ti18nLocale }>();

  const currentLocalOption = React.useMemo(() => I18N_LOCALES_OPTIONS.find((option) => option.value === currentLocale), [currentLocale]);

  const getTargetLocaleOption = React.useCallback((targetLocale: Ti18nLocale) => I18N_LOCALES_OPTIONS.find((option) => option.value === targetLocale), []);

  const getReplacedPathnameWithTargetLocale = React.useCallback(
    (targetLocale: Ti18nLocale) => pathname.replace(`/${currentLocale}`, `/${targetLocale}`),
    [pathname, currentLocale],
  );

  return {
    currentLocale,
    currentLocalOption,
    getTargetLocaleOption,
    getReplacedPathnameWithTargetLocale,
  };
}
