"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import { useMutation } from "@tanstack/react-query";
import { Button, Form, FormField, notify, Space, Theme, Typography } from "venomous-ui-react/components";

import { ROUTER_PATHS } from "@/client/routes";
import { useI18nDictionary, useI18nLocale } from "@/utils/i18n/index.client";
import { useTRPC } from "@/utils/trpc/index.client";

const AuthSigninForm = React.memo(() => {
  const { themeColor } = Theme.useThemeColor();

  const router = useRouter();
  const trpc = useTRPC();
  const dictionary = useI18nDictionary();
  const { currentLocale } = useI18nLocale();

  const mutation = useMutation(
    trpc.auth.signin.mutationOptions({
      onSuccess: () => {
        notify({
          type: "success",
          title: dictionary.service_auth.apiResults.SIGNIN_SUCCESS,
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
      email: "admin@example.com",
      password: "test123456789",
    });
  }, [mutation]);

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <Space.Flex column>
        <Typography.Title as="h3" text={dictionary.service_auth.uiMessages.SIGNIN} />
        <Space.Flex style={{ flexWrap: "wrap", alignItems: "center" }}>
          <Typography.Text text={dictionary.service_auth.uiMessages.DO_NOT_HAVE_AN_ACCOUNT} style={{ marginRight: "8px" }} />
          <Link href={`/${currentLocale}${ROUTER_PATHS.AUTH.SIGNUP}`} style={{ textDecorationSkipInk: "auto", textDecoration: "underline", color: themeColor }}>
            <Typography.Text text={dictionary.service_auth.uiMessages.CREATE_AN_ACCOUNT} style={{ color: "inherit" }} />
          </Link>
        </Space.Flex>
      </Space.Flex>

      <Space.Flex column gap={16} style={{ margin: "40px 0" }}>
        <FormField.Text name="email" label={dictionary.service_auth.uiForm.labels.email} fullWidth />
        <FormField.Password name="password" label={dictionary.service_auth.uiForm.labels.password} fullWidth />
      </Space.Flex>

      <Space.Flex gap={8}>
        <Button type="reset" text={dictionary.common.buttonText.cancel} variant="outlined" semanticColor="error" />
        <Button type="submit" text={dictionary.common.buttonText.submit} />
      </Space.Flex>
    </Form>
  );
});

AuthSigninForm.displayName = "AuthSigninForm";
export default AuthSigninForm;
