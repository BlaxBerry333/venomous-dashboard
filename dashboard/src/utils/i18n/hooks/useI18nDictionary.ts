"use client";

import React from "react";

import { I18nContext } from "../provider/I18nProvider";
import type { I18nDictionary } from "../types";

/**
 * Returns the dictionary of translations for the current locale.
 * @example
 * const dictionary = useI18nDictionary();
 * console.log(dictionary[namespace][key]);
 */
export default function useI18nDictionary(): I18nDictionary {
  const context = React.useContext(I18nContext);
  if (context === null) {
    throw new Error("useI18nDictionary must be used within an I18nProvider");
  }
  return context;
}
