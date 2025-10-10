import { AuthSigninForm } from "@/client/features/auth";
import { getDictionary } from "@/utils/i18n/dictionaries";
import type { Ti18nLocale } from "@/utils/i18n/index.types";

export async function generateMetadata({ params }: { params: Promise<{ locale: Ti18nLocale }> }) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale, ["common"]);
  return {
    title: dictionary.common.NAVIGATION_PAGE.AUTH_SIGNIN.TITLE,
    description: dictionary.common.NAVIGATION_PAGE.AUTH_SIGNIN.DESCRIPTION,
  };
}

export default async function SigninPage() {
  return <AuthSigninForm />;
}
