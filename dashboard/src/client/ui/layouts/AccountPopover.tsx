"use client";

import { useRouter } from "next/navigation";
import React from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Divider, Icon, Menu, notify, Space, Typography } from "venomous-ui-react/components";
import { useHandler } from "venomous-ui-react/hooks";
import { SEMANTIC_COLORS } from "venomous-ui-react/utils";

import { ROUTER_PATHS } from "@/client/routes";
import { useI18nDictionary, useI18nLocale } from "@/utils/i18n/index.client";
import { useTRPC } from "@/utils/trpc/index.client";
import { extractTRPCErrorInfo } from "@/utils/trpc/types";
import CustomModal from "../custom/CustomModal";
import CustomPopover from "../custom/CustomPopover";

const AccountPopover = React.memo<{
  triggerHeight?: number;
}>(({ triggerHeight }) => {
  const router = useRouter();
  const trpc = useTRPC();
  const dictionary = useI18nDictionary();
  const { currentLocale } = useI18nLocale();
  const modalHandlerOfUserProfile = useHandler();

  const queryOfUser = useQuery(trpc.user.getProfile.queryOptions());

  const mutationOfLogout = useMutation(
    trpc.auth.logout.mutationOptions({
      onSuccess: () => {
        notify({
          type: "success",
          title: dictionary.service_auth.API_RESULTS.LOGOUT_SUCCESS,
        });
        router.replace(`/${currentLocale}${ROUTER_PATHS.AUTH.SIGNIN}`);
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

  if (!queryOfUser.data) {
    return null;
  }

  return (
    <>
      <CustomPopover
        alignment="end"
        triggerStyle={{ height: triggerHeight ?? "100%" }}
        renderTrigger={() => <Icon icon="solar:user-circle-bold-duotone" width={24} />}
      >
        <React.Suspense>
          <Menu.List style={{ minWidth: "160px" }}>
            <Menu.Item
              icon="solar:user-circle-bold-duotone"
              id="profile"
              text={dictionary.service_auth.UI_MESSAGES.USER_PROFILE}
              onClick={modalHandlerOfUserProfile.open}
            />
            <Divider />
            <Menu.Item
              icon="solar:logout-line-duotone"
              id="logout"
              text={dictionary.service_auth.UI_MESSAGES.LOGOUT}
              onClick={() => void mutationOfLogout.mutateAsync()}
              style={{ backgroundColor: SEMANTIC_COLORS.error, color: "white" }}
            />
          </Menu.List>
        </React.Suspense>
      </CustomPopover>

      <React.Suspense>
        <CustomModal maskClosable maxBreakpoint="sm" onClose={modalHandlerOfUserProfile.close} isOpen={modalHandlerOfUserProfile.isOpen}>
          <UserProfileModalContentRows
            list={[
              { label: dictionary.service_auth.UI_MESSAGES.USER_ID, value: queryOfUser.data.id },
              { label: dictionary.service_auth.UI_MESSAGES.USER_NAME, value: queryOfUser.data.name },
              { label: dictionary.service_auth.UI_MESSAGES.USER_EMAIL, value: queryOfUser.data.email },
              { label: dictionary.service_auth.UI_MESSAGES.IS_EMAIL_VERIFIED, value: queryOfUser.data.emailVerified ? "Yes" : "No" },
              { label: dictionary.service_auth.UI_MESSAGES.USER_ROLE_NAME, value: queryOfUser.data.roleName },
              { label: dictionary.service_auth.UI_MESSAGES.CREATED_AT, value: new Date(queryOfUser.data.createdAt).toLocaleString() },
              { label: dictionary.service_auth.UI_MESSAGES.UPDATED_AT, value: new Date(queryOfUser.data.updatedAt).toLocaleString() },
              { label: dictionary.service_auth.UI_MESSAGES.LAST_LOGIN, value: new Date(queryOfUser.data.lastLogin ?? 0).toLocaleString() },
            ]}
          />
        </CustomModal>
      </React.Suspense>
    </>
  );
});

AccountPopover.displayName = "AccountPopover";
export default AccountPopover;

const UserProfileModalContentRows = React.memo<{ list: Array<{ label: string; value?: string }> }>(({ list }) => {
  return list.map((item, index) => (
    <Space.Flex key={item.label} style={{ alignItems: "center", marginBottom: index === list.length - 1 ? 0 : "16px" }}>
      <Typography.Title text={item.label} as="h6" style={{ flex: 1 }} />
      <Typography.Text text={item.value ?? ""} style={{ flex: 2, textAlign: "right", wordWrap: "break-word" }} />
    </Space.Flex>
  ));
});

UserProfileModalContentRows.displayName = "UserProfileModalContentRows";
