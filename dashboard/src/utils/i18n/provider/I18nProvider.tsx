"use client";

import React from "react";

import type { Ti18nDictionary } from "../index.types";

export const I18nContext = React.createContext<Ti18nDictionary | null>(null);

const I18nProvider = React.memo<React.PropsWithChildren<{ dictionary: Ti18nDictionary }>>(({ children, dictionary }) => {
  return <I18nContext.Provider value={dictionary}>{children}</I18nContext.Provider>;
});

I18nProvider.displayName = "I18nProvider";
export default I18nProvider;
