import type { Metadata } from "next";

import { i18n, type I18nLocale } from "@/utils/i18n/index.client";
import { getDictionary } from "@/utils/i18n/index.serve";

export const metadata: Metadata = {
  title: "Dashboard Media",
  description: "...",
};

export default async function DashboardMediaPage({ params }: { params: Promise<{ locale: I18nLocale }> }) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale, [...i18n.namespaces, "workflow"]);

  return (
    <div>
      Media
      <h1>{dictionary.workflow.title}</h1>
      <p>{dictionary.workflow.description}</p>
      <p style={{ margin: "20px 0" }}>{dictionary.common.greeting}</p>
    </div>
  );
}
