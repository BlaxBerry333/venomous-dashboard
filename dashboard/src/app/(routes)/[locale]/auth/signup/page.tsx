import type { Metadata } from "next";

import { AuthSignupPageView } from "@/client/features/auth-signup";

export const metadata: Metadata = {
  title: "Signup",
  description: "...",
};

export default async function SignupPage() {
  return (
    <div>
      <AuthSignupPageView />
    </div>
  );
}
