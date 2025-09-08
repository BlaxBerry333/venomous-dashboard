import React from "react";

import { i18n, I18nProvider } from "@/utils/i18n/index.client";
import { getDictionary } from "@/utils/i18n/index.serve";
import type { Ti18nLocale } from "@/utils/i18n/index.types";

export default async function LocaleRoutesLayout({ children, params }: React.PropsWithChildren<{ params: Promise<{ locale: Ti18nLocale }> }>) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale, i18n.namespaces);

  return <I18nProvider dictionary={dictionary}>{children}</I18nProvider>;
}
