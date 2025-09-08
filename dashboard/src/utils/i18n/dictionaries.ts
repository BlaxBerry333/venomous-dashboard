import "server-only";

import { i18n } from "./config";
import type { Ti18nDictionary, Ti18nLocale, Ti18nNamespace, Ti18nNamespaceDictionary } from "./index.types";

const dictionaries: Ti18nNamespaceDictionary = i18n.locales.reduce((acc, locale) => {
  acc[locale] = i18n.namespaces.reduce(
    (nsAcc, namespace) => {
      nsAcc[namespace] = () => import(`./locales/${locale}/${namespace}.json`).then((module) => module.default);
      return nsAcc;
    },
    {} as Record<Ti18nNamespace, () => Promise<Ti18nDictionary[Ti18nNamespace]>>,
  );
  return acc;
}, {} as Ti18nNamespaceDictionary);

/**
 * Returns the dictionary of translations for a given locale and namespaces.
 * @param locale The locale to fetch, as defined in i18n-config.
 * @param namespaces A readonly array of namespaces to load.
 * @returns A promise that resolves to a dictionary containing the requested namespaces.
 */
export const getDictionary = async <N extends Ti18nNamespace>(locale: Ti18nLocale, namespaces: readonly N[]): Promise<Pick<Ti18nDictionary, N>> => {
  const localeDictionaries = dictionaries[locale] ?? dictionaries[i18n.defaultLocale];

  const requestedDictionaries = await Promise.all(
    namespaces.map(async (ns) => {
      const load = localeDictionaries[ns];
      const content = await load();
      return { [ns]: content };
    }),
  );

  return requestedDictionaries.reduce((acc, curr) => ({ ...acc, ...curr }), {}) as Pick<Ti18nDictionary, N>;
};
