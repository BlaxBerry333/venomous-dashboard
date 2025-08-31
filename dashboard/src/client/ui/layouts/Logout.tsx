"use client";

import { useRouter } from "next/navigation";
import React from "react";

import { useMutation } from "@tanstack/react-query";
import { Buttons } from "venomous-ui-react/components";

import { ROUTER_PATHS } from "@/client/routes";
import { useTRPC } from "@/utils/trpc/index.client";

const Logout = React.memo(() => {
  const router = useRouter();
  const trpc = useTRPC();

  const mutation = useMutation(
    trpc.auth.logout.mutationOptions({
      onSuccess: (data) => {
        console.log({ data });
        router.replace(ROUTER_PATHS.AUTH.SIGNIN);
      },
      onError: (error) => {
        console.log({ error });
      },
    }),
  );

  const handleSubmit = React.useCallback(async () => {
    await mutation.mutateAsync();
  }, [mutation]);

  return <Buttons.Icon variant="contained" semanticColor="error" icon="material-symbols:logout-rounded" onClick={handleSubmit} />;
});

Logout.displayName = "Logout";
export default Logout;
