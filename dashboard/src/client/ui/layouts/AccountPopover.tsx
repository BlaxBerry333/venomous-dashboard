"use client";

import React from "react";

import { Avatar, Dialog, Icon, Menu, Popover, Space, Typography } from "venomous-ui-react/components";
import { SEMANTIC_COLORS } from "venomous-ui-react/constants";

import { useI18nDictionary } from "@/utils/i18n/index.client";
import { useAuthGuardContext, type TAuthGuardContext } from "../guards/AuthGuard";

const AccountPopover = React.memo<{
  triggerHeight?: number;
}>(({ triggerHeight }) => {
  const dictionary = useI18nDictionary();

  const { userData, logout } = useAuthGuardContext();

  const [openUserProfile, setOpenUserProfile] = React.useState<boolean>(false);

  if (!userData) {
    return null;
  }

  return (
    <>
      <Popover
        trigger="click"
        placement="bottom"
        content={
          <React.Suspense fallback={null}>
            <Menu.List>
              <Menu.Item
                label={dictionary.service_auth.UI_MESSAGES.USER_PROFILE}
                Icon={<Icon icon="solar:user-circle-bold-duotone" />}
                onClick={() => setOpenUserProfile(true)}
              />
              <Menu.Item
                label={dictionary.service_auth.UI_MESSAGES.LOGOUT}
                Icon={<Icon icon="solar:logout-line-duotone" />}
                onClick={() => void logout()}
                style={{ backgroundColor: SEMANTIC_COLORS.ERROR, color: "#ffffff" }}
              />
            </Menu.List>
          </React.Suspense>
        }
      >
        {({ ref }) => (
          <Space.Flex
            ref={ref}
            style={{
              height: triggerHeight,
              width: "max-content",
              cursor: "pointer",
            }}
          >
            <Avatar src={userData.avatarPath} alt={userData.name} text={userData.name} width={32} />
          </Space.Flex>
        )}
      </Popover>

      <React.Suspense fallback={null}>
        <Dialog open={openUserProfile} onClickBackdrop={() => setOpenUserProfile(false)} autoCloseOnClickBackdrop maxWidth="XS">
          <UserProfileModalContentRows userData={userData} />
        </Dialog>
      </React.Suspense>
    </>
  );
});

AccountPopover.displayName = "AccountPopover";
export default AccountPopover;

const UserProfileModalContentRows = React.memo<Pick<TAuthGuardContext, "userData">>(({ userData: data }) => {
  const dictionary = useI18nDictionary();

  const list = React.useMemo<Array<{ label: string; value: string }>>(
    () =>
      !data
        ? []
        : [
            { label: dictionary.service_auth.UI_MESSAGES.USER_ID, value: data.id },
            { label: dictionary.service_auth.UI_MESSAGES.USER_NAME, value: data.name },
            { label: dictionary.service_auth.UI_MESSAGES.USER_EMAIL, value: data.email },
            { label: dictionary.service_auth.UI_MESSAGES.IS_EMAIL_VERIFIED, value: data.emailVerified ? "✅" : "❌" },
            { label: dictionary.service_auth.UI_MESSAGES.USER_ROLE_NAME, value: data.roleName },
            { label: dictionary.service_auth.UI_MESSAGES.CREATED_AT, value: new Date(data.createdAt).toLocaleString() },
            { label: dictionary.service_auth.UI_MESSAGES.UPDATED_AT, value: new Date(data.updatedAt).toLocaleString() },
            { label: dictionary.service_auth.UI_MESSAGES.LAST_LOGIN, value: new Date(data.lastLogin ?? 0).toLocaleString() },
          ],
    [data, dictionary],
  );

  return (
    <Menu.List style={{ padding: 0 }}>
      {list.map((item) => (
        <Menu.Item key={item.label} style={{ padding: 0 }}>
          <Typography.Text text={item.label} as="strong" style={{ flex: 1 }} />
          <Typography.Text text={item.value} as="small" style={{ flex: 2, textAlign: "right", wordWrap: "break-word" }} />
        </Menu.Item>
      ))}
    </Menu.List>
  );
});

UserProfileModalContentRows.displayName = "UserProfileModalContentRows";
