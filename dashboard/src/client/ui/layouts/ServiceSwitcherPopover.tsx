"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { Menu, Space, Typography } from "venomous-ui-react/components";

import { getServiceNameFromPathname, ROUTER_PATHS } from "@/client/routes";
import { SERVICE_NAMES } from "@/client/routes/paths";
import { useI18nDictionary, useI18nLocale } from "@/utils/i18n/index.client";
import CustomPopover from "../custom/CustomPopover";
import Logo from "./Logo";

const ServiceSwitcherPopover = React.memo<{
  triggerHeight?: number;
}>(({ triggerHeight }) => {
  const dictionary = useI18nDictionary();
  const { currentLocale } = useI18nLocale();

  const pathname = usePathname();

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
    <CustomPopover
      alignment="start"
      triggerStyle={{ height: triggerHeight ?? "100%", padding: "0 8px" }}
      renderTrigger={() => (
        <Space.Flex gap={8} style={{ alignItems: "center", padding: "0 8px" }}>
          <Logo serviceName={currentService?.serviceName} size={40} />
          <Typography.Text text={currentService.text} />
        </Space.Flex>
      )}
    >
      <React.Suspense>
        <Menu.List style={{ minWidth: "200px" }}>
          {serviceItems.map((currentItem, index) => {
            const { serviceName, text, subText } = currentItem;
            const isSelected = serviceName === currentService.serviceName;
            return (
              <Link href={currentItem.path} key={serviceName}>
                <Menu.Item
                  id={serviceName}
                  text={text}
                  subText={` ( ${subText} )`}
                  renderStartElement={() => <Logo serviceName={serviceName} size={40} />}
                  isActive={isSelected}
                  style={{ marginBottom: index === serviceItems.length - 1 ? 0 : "8px", cursor: "pointer" }}
                />
              </Link>
            );
          })}
        </Menu.List>
      </React.Suspense>
    </CustomPopover>
  );
});

ServiceSwitcherPopover.displayName = "ServiceSwitcherPopover";
export default ServiceSwitcherPopover;
