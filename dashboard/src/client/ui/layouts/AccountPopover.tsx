"use client";

import { useRouter } from "next/navigation";
import React from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Divider, Icon, Menu, notify, Space, Theme, Typography } from "venomous-ui-react/components";
import { SEMANTIC_COLORS } from "venomous-ui-react/utils";

import { ROUTER_PATHS } from "@/client/routes";
import { useI18nDictionary } from "@/utils/i18n/index.client";
import { useTRPC } from "@/utils/trpc/index.client";
import { extractTRPCErrorInfo } from "@/utils/trpc/types";
import CustomPopover from "../custom/CustomPopover";

const AccountPopover = React.memo<{
  triggerHeight: number;
}>(({ triggerHeight }) => {
  const { themeColor } = Theme.useThemeColor();

  const router = useRouter();
  const trpc = useTRPC();
  const { service_auth: dictionaryOfServiceAuth } = useI18nDictionary();

  const queryOfUser = useQuery(trpc.user.getProfile.queryOptions());

  const mutationOfLogout = useMutation(
    trpc.auth.logout.mutationOptions({
      onSuccess: () => {
        notify({
          type: "success",
          title: dictionaryOfServiceAuth.apiResults.LOGOUT_SUCCESS,
        });
        router.replace(ROUTER_PATHS.AUTH.SIGNIN);
      },
      onError: (error) => {
        const { errorCode, errorMessage } = extractTRPCErrorInfo(error);
        notify({
          type: "error",
          title: dictionaryOfServiceAuth.apiResults?.[errorCode],
          description: errorMessage,
        });
      },
    }),
  );

  if (!queryOfUser.data) {
    return null;
  }

  return (
    <CustomPopover
      alignment="end"
      triggerStyle={{ height: triggerHeight }}
      renderTrigger={({ isOpen }) => (
        <Icon
          icon="solar:user-circle-line-duotone"
          width={24}
          style={{
            ...(isOpen ? { color: themeColor } : {}),
          }}
        />
      )}
    >
      <React.Suspense>
        <Menu.List style={{ minWidth: "160px" }}>
          <Space.Flex column style={{ padding: "8px" }}>
            <Typography.Text isEllipsis text={queryOfUser.data?.name ?? ""} />
            <Typography.Text isEllipsis text={queryOfUser.data?.email ?? ""} />
          </Space.Flex>

          <Divider />

          <Menu.Item
            icon="solar:shield-user-line-duotone"
            id="profile"
            text={dictionaryOfServiceAuth.UI_MESSAGES.USER_PROFILE}
            onClick={() => void router.push(ROUTER_PATHS.DASHBOARD.USER_PROFILE)}
          />

          <Divider />

          <Menu.Item
            icon="solar:logout-line-duotone"
            id="logout"
            text={dictionaryOfServiceAuth.UI_MESSAGES.LOGOUT}
            onClick={() => void mutationOfLogout.mutateAsync()}
            style={{ backgroundColor: SEMANTIC_COLORS.error, color: "white" }}
          />
        </Menu.List>
      </React.Suspense>
    </CustomPopover>
  );
});

AccountPopover.displayName = "AccountPopover";
export default AccountPopover;
