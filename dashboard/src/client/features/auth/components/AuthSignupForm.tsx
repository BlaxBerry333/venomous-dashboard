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
import { AUTH_SIGNUP_FORM_DEFAULT_VALUES, AUTH_SIGNUP_SCHEMA, type TAuthSignupSchema } from "@/utils/validation";

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
          title: dictionary.service_auth.API_RESULTS.SIGNUP_SUCCESS,
        });
        router.replace(`/${currentLocale}${ROUTER_PATHS.DASHBOARD.NOTES_LIST}`);
      },
      onError: (error) => {
        const { errorCode, errorMessage } = extractTRPCErrorInfo(error);
        notify({
          type: "error",
          title: dictionary.service_auth.API_RESULTS?.[errorCode],
          description: errorMessage,
        });
      },
    }),
  );

  const formInstance = useForm<TAuthSignupSchema>({
    mode: "all",
    resolver: zodResolver(AUTH_SIGNUP_SCHEMA),
    defaultValues: AUTH_SIGNUP_FORM_DEFAULT_VALUES,
  });

  React.useLayoutEffect(() => {
    formInstance.trigger();
  }, [formInstance]);

  const handleSubmit = React.useCallback(
    async (values: TAuthSignupSchema) => {
      await mutation.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
        passwordConfirm: values.passwordConfirm,
      });
    },
    [mutation],
  );

  const handleReset = React.useCallback(() => {
    formInstance.reset(AUTH_SIGNUP_FORM_DEFAULT_VALUES);
    formInstance.trigger();
  }, [formInstance]);

  return (
    <FormProvider {...formInstance}>
      <Form onSubmit={formInstance.handleSubmit(handleSubmit)} onReset={handleReset}>
        <Space.Flex column>
          <Typography.Title as="h3" text={dictionary.service_auth.UI_MESSAGES.SIGNUP} />
          <Space.Flex style={{ flexWrap: "wrap", alignItems: "center" }}>
            <Typography.Text text={dictionary.service_auth.UI_MESSAGES.ALREADY_HAVE_AN_ACCOUNT} style={{ marginRight: "8px" }} />
            <Link
              href={`/${currentLocale}${ROUTER_PATHS.AUTH.SIGNIN}`}
              style={{ textDecorationSkipInk: "auto", textDecoration: "underline", color: themeColor }}
            >
              <Typography.Text text={dictionary.service_auth.UI_MESSAGES.SIGNIN} style={{ color: "inherit" }} />
            </Link>
          </Space.Flex>
        </Space.Flex>

        <Space.Flex column gap={16} style={{ margin: "40px 0" }}>
          <Controller
            name="name"
            control={formInstance.control}
            render={({ field, fieldState: { error } }) => (
              <FormField.Text
                label={dictionary.service_auth.UI_FORM_LABELS.NAME}
                fullWidth
                value={field.value}
                onChange={field.onChange}
                isError={!!error}
                helpText={dictionary.validations[error?.message ?? ""] ?? error?.message}
              />
            )}
          />
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
          <Controller
            name="passwordConfirm"
            control={formInstance.control}
            render={({ field, fieldState: { error } }) => (
              <FormField.Text
                label={dictionary.service_auth.UI_FORM_LABELS.PASSWORD_CONFIRM}
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

AuthSignupForm.displayName = "AuthSignupForm";
export default AuthSignupForm;
