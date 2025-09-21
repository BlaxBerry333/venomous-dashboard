"use client";

import { useRouter } from "next/navigation";
import React from "react";

import { useMutation } from "@tanstack/react-query";
import { Divider, Icon, Menu, Space, Theme, Typography } from "venomous-ui-react/components";
import { SEMANTIC_COLORS } from "venomous-ui-react/utils";

import { ROUTER_PATHS } from "@/client/routes";
import { useI18nDictionary } from "@/utils/i18n/index.client";
import { useTRPC } from "@/utils/trpc/index.client";
import CustomPopover from "../custom/CustomPopover";

const MOCK_USER = {
  name: "Admin",
  email: "test@example.com",
};

const AccountPopover = React.memo<{
  triggerHeight: number;
}>(({ triggerHeight }) => {
  const { themeColor } = Theme.useThemeColor();

  const router = useRouter();
  const trpc = useTRPC();
  const dictionary = useI18nDictionary();

  const mutationOfLogout = useMutation(
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
            <Typography.Text isEllipsis text={MOCK_USER.name} />
            <Typography.Text isEllipsis text={MOCK_USER.email} />
          </Space.Flex>

          <Divider />

          <Menu.Item
            icon="solar:shield-user-line-duotone"
            id="profile"
            text={dictionary.service_auth.uiMessages.USER_PROFILE}
            onClick={() => void mutationOfLogout.mutateAsync()}
          />

          <Divider />

          <Menu.Item
            icon="solar:logout-line-duotone"
            id="logout"
            text={dictionary.service_auth.uiMessages.LOGOUT}
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
