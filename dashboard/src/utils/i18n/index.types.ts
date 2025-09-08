import type { i18n } from "./config";

export type Ti18nLocale = (typeof i18n.locales)[number];

export type Ti18nNamespace = (typeof i18n.namespaces)[number];

export type Ti18nDictionary = Readonly<Record<Ti18nNamespace, any>>; // eslint-disable-line @typescript-eslint/no-explicit-any

export type Ti18nNamespaceDictionary = Record<Ti18nLocale, Record<Ti18nNamespace, () => Promise<Ti18nDictionary[Ti18nNamespace]>>>;
