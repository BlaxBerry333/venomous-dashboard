"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, notify } from "venomous-ui-react/components";

import { ROUTER_PATHS } from "@/client/routes";
import { useI18nDictionary, useI18nLocale } from "@/utils/i18n/index.client";
import { useTRPC } from "@/utils/trpc/index.client";
import { extractTRPCErrorInfo } from "@/utils/trpc/types";

const DashboardNotesDetailView = React.memo(() => {
  const router = useRouter();
  const id = useSearchParams().get("id") as string;

  const dictionary = useI18nDictionary();
  const { currentLocale } = useI18nLocale();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutationOfDeleteMemo = useMutation(
    trpc.notes.deleteMemo.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.notes.getListMemos.queryOptions().queryKey,
          exact: false,
        });
        notify({
          type: "SUCCESS",
          title: dictionary.service_notes.API_RESULTS.DELETE_MEMO_SUCCESS,
        });
        router.replace(`/${currentLocale}${ROUTER_PATHS.DASHBOARD.NOTES_LIST}`);
      },
      onError: (error) => {
        const { errorCode, errorMessage } = extractTRPCErrorInfo(error);
        notify({
          type: "ERROR",
          title: dictionary.service_notes.API_RESULTS?.[errorCode],
          description: errorMessage,
        });
      },
    }),
  );

  return (
    <>
      <Button text={dictionary.common.BUTTON_TEXT.DELETE} onClick={() => void mutationOfDeleteMemo.mutateAsync({ id })} />
    </>
  );
});

DashboardNotesDetailView.displayName = "DashboardNotesDetailView";
export default DashboardNotesDetailView;
