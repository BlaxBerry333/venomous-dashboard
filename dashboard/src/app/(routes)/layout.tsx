import "@/client/styles/globals.css";

import type { Metadata } from "next";
import React from "react";

import { FontFamilyVariableNames } from "@/client/styles/fonts";
import { ThemeProvider } from "@/client/ui";
import { i18n, I18nProvider, type I18nLocale } from "@/utils/i18n/index.client";
import { getDictionary } from "@/utils/i18n/index.serve";
import { TRPCQueryClientProvider } from "@/utils/trpc/index.client";

export const metadata: Metadata = {
  title: {
    default: "Venomous Dashboard",
    template: `%s | Venomous Dashboard (${process.env.NODE_ENV})`,
  },
  description: "...",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({ children, params }: React.PropsWithChildren<{ params: Promise<{ locale: I18nLocale }> }>) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale, i18n.namespaces);

  return (
    <html lang={locale}>
      <body className={`${FontFamilyVariableNames}`}>
        <TRPCQueryClientProvider>
          <I18nProvider dictionary={dictionary}>
            <ThemeProvider>
              <div id="root">{children}</div>
            </ThemeProvider>
          </I18nProvider>
        </TRPCQueryClientProvider>
      </body>
    </html>
  );
}
