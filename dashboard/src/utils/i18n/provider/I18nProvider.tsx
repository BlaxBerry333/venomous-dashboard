"use client";

import React from "react";

import type { I18nDictionary } from "../types";

export const I18nContext = React.createContext<I18nDictionary | null>(null);

const I18nProvider = React.memo<React.PropsWithChildren<{ dictionary: I18nDictionary }>>(({ children, dictionary }) => {
  return <I18nContext.Provider value={dictionary}>{children}</I18nContext.Provider>;
});

I18nProvider.displayName = "I18nProvider";
export default I18nProvider;
