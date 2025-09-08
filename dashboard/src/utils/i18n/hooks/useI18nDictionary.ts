"use client";

import React from "react";

import type { Ti18nDictionary } from "../index.types";
import { I18nContext } from "../provider/I18nProvider";

/**
 * Returns the dictionary of translations for the current locale.
 * @example
 * const dictionary = useI18nDictionary();
 * console.log(dictionary[namespace][key]);
 */
export default function useI18nDictionary(): Ti18nDictionary {
  const context = React.useContext(I18nContext);
  if (context === null) {
    throw new Error("useI18nDictionary must be used within an I18nProvider");
  }
  return context;
}
