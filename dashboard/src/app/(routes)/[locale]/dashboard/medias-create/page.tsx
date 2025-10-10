import { getDictionary } from "@/utils/i18n/dictionaries";
import type { Ti18nLocale } from "@/utils/i18n/index.types";

export async function generateMetadata({ params }: { params: Promise<{ locale: Ti18nLocale }> }) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale, ["common"]);
  return {
    title: dictionary.common.NAVIGATION_PAGE.MEDIAS_CREATE.TITLE,
    description: dictionary.common.NAVIGATION_PAGE.MEDIAS_CREATE.DESCRIPTION,
  };
}

export default async function DashboardMediasCreatePage() {
  return <div>Medias Create</div>;
}
