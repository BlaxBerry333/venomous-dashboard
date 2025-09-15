"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import { useMutation } from "@tanstack/react-query";
import { Button, Form, FormField, notify, Space, Theme, Typography } from "venomous-ui-react/components";

import { ROUTER_PATHS } from "@/client/routes";
import { useI18nDictionary, useI18nLocale } from "@/utils/i18n/index.client";
import { useTRPC } from "@/utils/trpc/index.client";

const AuthSignupForm = React.memo(() => {
  const { themeColor } = Theme.useThemeColor();

  const router = useRouter();
  const trpc = useTRPC();
  const dictionary = useI18nDictionary();
  const { currentLocale } = useI18nLocale();

  const mutation = useMutation(
    trpc.auth.signup.mutationOptions({
      onSuccess: () => {
        notify({
          type: "success",
          title: dictionary.service_auth.apiResults.SIGNUP_SUCCESS,
        });
        router.replace(ROUTER_PATHS.DASHBOARD.ROOT);
      },
      onError: (error) => {
        notify({
          type: "error",
          title: error.message,
        });
      },
    }),
  );

  const handleSubmit = React.useCallback(async () => {
    await mutation.mutateAsync({
      name: "Admin User",
      email: "admin@example.com",
      password: "test123456789",
      confirmPassword: "test123456789",
    });
  }, [mutation]);

  return (
    <Form
      gap={0}
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <Space.Flex column gap={0}>
        <Typography.Title as="h3" text={dictionary.service_auth.uiMessages.SIGNUP} />
        <Space.Flex row gap={0} style={{ flexWrap: "wrap", alignItems: "center" }}>
          <Typography.Text text={dictionary.service_auth.uiMessages.ALREADY_HAVE_AN_ACCOUNT} style={{ marginRight: "8px" }} />
          <Link href={`/${currentLocale}${ROUTER_PATHS.AUTH.SIGNIN}`} style={{ textDecorationSkipInk: "auto", textDecoration: "underline", color: themeColor }}>
            <Typography.Text text={dictionary.service_auth.uiMessages.SIGNIN} style={{ color: "inherit" }} />
          </Link>
        </Space.Flex>
      </Space.Flex>

      <Space.Flex column gap={16} style={{ margin: "40px 0" }}>
        <FormField.Text name="email" label={dictionary.service_auth.uiForm.labels.name} fullWidth />
        <FormField.Text name="email" label={dictionary.service_auth.uiForm.labels.email} fullWidth />
        <FormField.Password name="password" label={dictionary.service_auth.uiForm.labels.password} fullWidth />
        <FormField.Password name="password" label={dictionary.service_auth.uiForm.labels.confirmPassword} fullWidth />
      </Space.Flex>

      <Space.Flex row>
        <Button type="reset" text={dictionary.common.buttonText.cancel} variant="outlined" semanticColor="error" />
        <Button type="submit" text={dictionary.common.buttonText.submit} />
      </Space.Flex>
    </Form>
  );
});

AuthSignupForm.displayName = "AuthSignupForm";
export default AuthSignupForm;
