"use client";

import { usePathname, useRouter } from "next/navigation";
import React from "react";

import { Menu, Popover, Space, Typography } from "venomous-ui-react/components";

import { getServiceNameFromPathname, ROUTER_PATHS } from "@/client/routes";
import { SERVICE_NAMES } from "@/client/routes/paths";
import { useI18nDictionary, useI18nLocale } from "@/utils/i18n/index.client";

import Logo from "./Logo";

const ServiceSwitcherPopover = React.memo<{
  triggerHeight?: number;
}>(({ triggerHeight }) => {
  const router = useRouter();
  const pathname = usePathname();

  const dictionary = useI18nDictionary();
  const { currentLocale } = useI18nLocale();

  const serviceItems = React.useMemo(() => {
    return [
      {
        serviceName: SERVICE_NAMES.MEDIAS,
        text: dictionary.common.SERVICE.MEDIAS.LABEL,
        subText: SERVICE_NAMES.MEDIAS,
        path: `/${currentLocale}${ROUTER_PATHS.DASHBOARD.MEDIA_LIST}`,
      },
      {
        serviceName: SERVICE_NAMES.NOTES,
        text: dictionary.common.SERVICE.NOTES.LABEL,
        subText: SERVICE_NAMES.NOTES,
        path: `/${currentLocale}${ROUTER_PATHS.DASHBOARD.NOTES_LIST}`,
      },
      {
        serviceName: SERVICE_NAMES.WORKFLOWS,
        text: dictionary.common.SERVICE.WORKFLOWS.LABEL,
        subText: SERVICE_NAMES.WORKFLOWS,
        path: `/${currentLocale}${ROUTER_PATHS.DASHBOARD.WORKFLOW_LIST}`,
      },
    ];
  }, [dictionary, currentLocale]);

  const currentService = React.useMemo<(typeof serviceItems)[number] | undefined>(() => {
    const currentServiceName = getServiceNameFromPathname(pathname);
    return serviceItems.find((item) => item.serviceName === currentServiceName);
  }, [pathname, serviceItems]);

  if (!currentService) {
    return null;
  }

  return (
    <Popover
      trigger="click"
      placement="bottom"
      content={
        <Menu.List style={{ minWidth: "200px" }}>
          {serviceItems.map((currentItem) => {
            const { serviceName, text } = currentItem;
            const isSelected = serviceName === currentService.serviceName;
            return (
              <Menu.Item
                key={serviceName}
                Icon={<Logo serviceName={serviceName} />}
                label={text}
                selected={isSelected}
                onClick={() => {
                  if (isSelected) return;
                  router.push(currentItem.path);
                }}
              />
            );
          })}
        </Menu.List>
      }
    >
      {({ ref }) => (
        <Space.Flex
          ref={ref}
          spacing={8}
          style={{
            height: triggerHeight,
            alignItems: "center",
            padding: "0 8px",
            width: "max-content",
            cursor: "pointer",
          }}
        >
          <Logo serviceName={currentService?.serviceName} size={40} />
          <Typography.Text text={currentService.text} as="strong" />
        </Space.Flex>
      )}
    </Popover>
  );
});

ServiceSwitcherPopover.displayName = "ServiceSwitcherPopover";
export default ServiceSwitcherPopover;
