"use client";

import { useRouter } from "next/navigation";
import React from "react";

import { useMutation } from "@tanstack/react-query";
import { Button, Form, FormField, Space, Typography } from "venomous-ui-react/components";

import { ROUTER_PATHS } from "@/client/routes";
import { useTRPC } from "@/utils/trpc/index.client";

const AuthSigninForm = React.memo(() => {
  const router = useRouter();
  const trpc = useTRPC();

  const mutation = useMutation(
    trpc.auth.signin.mutationOptions({
      onSuccess: (data) => {
        console.log({ data });
        router.replace(ROUTER_PATHS.DASHBOARD.ROOT);
      },
      onError: (error) => {
        console.log({ error });
      },
    }),
  );

  const handleSubmit = React.useCallback(async () => {
    await mutation.mutateAsync({
      email: "admin@example.com",
      password: "password",
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
        <Typography.Title as="h3" text="Signin" />
        <Typography.Title as="h5" text="Signin to your account" />
      </Space.Flex>

      <Space.Flex column gap={16} style={{ margin: "40px 0" }}>
        <FormField.Text label="Email" name="email" fullWidth />
        <FormField.Password label="Password" name="password" fullWidth />
      </Space.Flex>

      <Space.Flex row>
        <Button type="reset" text="Cancel" variant="outlined" semanticColor="error" />
        <Button type="submit" text="Signin" />
      </Space.Flex>
    </Form>
  );
});

AuthSigninForm.displayName = "AuthSigninForm";
export default AuthSigninForm;
