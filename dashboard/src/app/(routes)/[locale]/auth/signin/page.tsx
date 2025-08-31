import type { Metadata } from "next";

import { AuthSigninForm } from "@/client/features/auth-signin";

export const metadata: Metadata = {
  title: "Signin",
  description: "...",
};

export default async function SigninPage() {
  // const session = await getSession();
  // if (session) redirect("/dashboard");

  return <AuthSigninForm />;
}
