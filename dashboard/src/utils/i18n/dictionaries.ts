import "server-only";

import { i18n } from "./config";
import type { I18nDictionary, I18nLocale, I18nNamespace, I18nNamespaceDictionary } from "./types";

const dictionaries: I18nNamespaceDictionary = i18n.locales.reduce((acc, locale) => {
  acc[locale] = i18n.namespaces.reduce(
    (nsAcc, namespace) => {
      nsAcc[namespace] = () => import(`./locales/${locale}/${namespace}.json`).then((module) => module.default);
      return nsAcc;
    },
    {} as Record<I18nNamespace, () => Promise<I18nDictionary[I18nNamespace]>>,
  );
  return acc;
}, {} as I18nNamespaceDictionary);

/**
 * Returns the dictionary of translations for a given locale and namespaces.
 * @param locale The locale to fetch, as defined in i18n-config.
 * @param namespaces A readonly array of namespaces to load.
 * @returns A promise that resolves to a dictionary containing the requested namespaces.
 */
export const getDictionary = async <N extends I18nNamespace>(locale: I18nLocale, namespaces: readonly N[]): Promise<Pick<I18nDictionary, N>> => {
  const localeDictionaries = dictionaries[locale] ?? dictionaries[i18n.defaultLocale];

  const requestedDictionaries = await Promise.all(
    namespaces.map(async (ns) => {
      const load = localeDictionaries[ns];
      const content = await load();
      return { [ns]: content };
    }),
  );

  return requestedDictionaries.reduce((acc, curr) => ({ ...acc, ...curr }), {}) as Pick<I18nDictionary, N>;
};
