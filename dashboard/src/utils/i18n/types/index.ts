import type { i18n } from "../config";

export type I18nLocale = (typeof i18n.locales)[number];

export type I18nNamespace = (typeof i18n.namespaces)[number];

export type I18nDictionary = Readonly<Record<string, any>>; // eslint-disable-line @typescript-eslint/no-explicit-any

export type I18nNamespaceDictionary = Record<I18nLocale, Record<I18nNamespace, () => Promise<I18nDictionary[I18nNamespace]>>>;
