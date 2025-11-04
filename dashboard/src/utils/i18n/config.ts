export const i18n = {
  defaultLocale: "en",
  locales: ["en", "zh-CN"] as const,
  namespaces: ["common", "validations", "service_auth", "service_notes", "service_workflow"] as const,
} as const;
