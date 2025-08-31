import type { TFunction } from "i18next";
import z from "zod";

export function getAuthSigninFormSchema(t: TFunction) {
  return z.object({
    email: z.email({ message: t("validations.INVALID") }),
    password: z.string().min(4, t("validations.TOO_SHORT")).max(20, t("validations.TOO_LONG")),
  });
}

export function getAuthSigninFormDefaultValues() {
  return {
    email: "",
    password: "",
  };
}
