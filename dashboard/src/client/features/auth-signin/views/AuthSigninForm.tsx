"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Button, Form, FormField, notify, Space, Theme, Typography } from "venomous-ui-react/components";

import { ROUTER_PATHS } from "@/client/routes";
import { useI18nDictionary, useI18nLocale } from "@/utils/i18n/index.client";
import { useTRPC } from "@/utils/trpc/index.client";
import { extractTRPCErrorInfo } from "@/utils/trpc/types";
import { AUTH_SIGNIN_FORM_DEFAULT_VALUES, AUTH_SIGNIN_SCHEMA, type TAuthSigninSchema } from "@/utils/validation";

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
          title: dictionary.service_auth.API_RESULTS.SIGNIN_SUCCESS,
        });
        router.replace(`/${currentLocale}${ROUTER_PATHS.DASHBOARD.NOTES_LIST}`);
      },
      onError: (error) => {
        const { errorCode, errorMessage } = extractTRPCErrorInfo(error);
        notify({
          type: "error",
          title: dictionary.service_auth.apiResults?.[errorCode],
          description: errorMessage,
        });
      },
    }),
  );

  const formInstance = useForm<TAuthSigninSchema>({
    mode: "all",
    resolver: zodResolver(AUTH_SIGNIN_SCHEMA),
    defaultValues: AUTH_SIGNIN_FORM_DEFAULT_VALUES,
  });

  React.useLayoutEffect(() => {
    formInstance.trigger();

    // test for development
    if (process.env.NODE_ENV === "development") {
      formInstance.setValue("email", "admin@example.com", { shouldValidate: true });
      formInstance.setValue("password", "admin123456789", { shouldValidate: true });
    }
  }, [formInstance]);

  const handleSubmit = React.useCallback(
    async (values: TAuthSigninSchema) => {
      await mutation.mutateAsync({
        email: values.email,
        password: values.password,
      });
    },
    [mutation],
  );

  const handleReset = React.useCallback(() => {
    formInstance.reset(AUTH_SIGNIN_FORM_DEFAULT_VALUES);
    formInstance.trigger();
  }, [formInstance]);

  return (
    <FormProvider {...formInstance}>
      <Form onSubmit={formInstance.handleSubmit(handleSubmit)} onReset={handleReset}>
        <Space.Flex column>
          <Typography.Title as="h3" text={dictionary.service_auth.UI_MESSAGES.SIGNIN} />
          <Space.Flex style={{ flexWrap: "wrap", alignItems: "center" }}>
            <Typography.Text text={dictionary.service_auth.UI_MESSAGES.DO_NOT_HAVE_AN_ACCOUNT} style={{ marginRight: "8px" }} />
            <Link
              href={`/${currentLocale}${ROUTER_PATHS.AUTH.SIGNUP}`}
              style={{ textDecorationSkipInk: "auto", textDecoration: "underline", color: themeColor }}
            >
              <Typography.Text text={dictionary.service_auth.UI_MESSAGES.CREATE_AN_ACCOUNT} style={{ color: "inherit" }} />
            </Link>
          </Space.Flex>
        </Space.Flex>

        <Space.Flex column gap={16} style={{ margin: "40px 0" }}>
          <Controller
            name="email"
            control={formInstance.control}
            render={({ field, fieldState: { error } }) => (
              <FormField.Text
                label={dictionary.service_auth.UI_FORM_LABELS.EMAIL}
                fullWidth
                value={field.value}
                onChange={field.onChange}
                isError={!!error}
                helpText={dictionary.validations[error?.message ?? ""] ?? error?.message}
              />
            )}
          />
          <Controller
            name="password"
            control={formInstance.control}
            render={({ field, fieldState: { error } }) => (
              <FormField.Text
                label={dictionary.service_auth.UI_FORM_LABELS.PASSWORD}
                fullWidth
                value={field.value}
                onChange={field.onChange}
                isError={!!error}
                helpText={dictionary.validations[error?.message ?? ""] ?? error?.message}
              />
            )}
          />
        </Space.Flex>

        <Space.Flex gap={8}>
          <Button
            type="reset"
            text={dictionary.common.BUTTON_TEXT.RESET}
            variant="outlined"
            semanticColor="error"
            disabled={!formInstance.formState.isDirty || mutation.isPending}
          />
          <Button
            type="submit"
            text={dictionary.common.BUTTON_TEXT.CONFIRM}
            isLoading={mutation.isPending}
            isDisabled={!!Object.keys(formInstance.formState.errors).length}
          />
        </Space.Flex>
      </Form>
    </FormProvider>
  );
});

AuthSigninForm.displayName = "AuthSigninForm";
export default AuthSigninForm;
