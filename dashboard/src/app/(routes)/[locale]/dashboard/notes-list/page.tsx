import { DashboardNotesListView } from "@/client/features/dashboard-notes";
import { getDictionary } from "@/utils/i18n/dictionaries";
import type { Ti18nLocale } from "@/utils/i18n/index.types";

export async function generateMetadata({ params }: { params: Promise<{ locale: Ti18nLocale }> }) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale, ["common"]);
  return {
    title: dictionary.common.NAVIGATION_PAGE.NOTES_LIST.TITLE,
    description: dictionary.common.NAVIGATION_PAGE.NOTES_LIST.DESCRIPTION,
  };
}

export default async function DashboardNotesListPage() {
  return <DashboardNotesListView />;
}
