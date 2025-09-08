import type { Metadata } from "next";

import { getDictionary } from "@/utils/i18n/index.serve";
import type { Ti18nLocale } from "@/utils/i18n/index.types";

export const metadata: Metadata = {
  title: "Dashboard Media",
  description: "...",
};

export default async function DashboardMediaPage({ params }: { params: Promise<{ locale: Ti18nLocale }> }) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale, ["common", "service_workflow"]);

  return (
    <div>
      Media
      <h1>{dictionary.service_workflow.title}</h1>
      <p>{dictionary.service_workflow.description}</p>
      <p style={{ margin: "20px 0" }}>{dictionary.common.greeting}</p>
    </div>
  );
}
