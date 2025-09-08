import "@/client/styles/globals.css";

import type { Metadata } from "next";
import React from "react";

import { FontFamilyVariableNames } from "@/client/styles/fonts";
import { ThemeProvider } from "@/client/ui";
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

export default function RootRoutesLayout({ children }: React.PropsWithChildren) {
  return (
    <html>
      <body className={`${FontFamilyVariableNames}`}>
        <TRPCQueryClientProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </TRPCQueryClientProvider>
      </body>
    </html>
  );
}
