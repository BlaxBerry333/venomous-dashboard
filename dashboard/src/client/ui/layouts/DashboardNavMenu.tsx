"use client";

import { usePathname, useRouter } from "next/navigation";
import React from "react";

import { Icon, Menu } from "venomous-ui-react/components";

import { getServiceNameFromPathname, ROUTER_PATHS } from "@/client/routes";
import { SERVICE_NAMES } from "@/client/routes/paths";
import { useI18nDictionary, useI18nLocale } from "@/utils/i18n/index.client";

const DashboardNavMenu = React.memo<{
  isCollapsed: boolean;
}>(({ isCollapsed }) => {
  const router = useRouter();
  const pathname = usePathname();

  const dictionary = useI18nDictionary();
  const { currentLocale } = useI18nLocale();

  const currentServiceName = React.useMemo(() => getServiceNameFromPathname(pathname), [pathname]);

  const navItems = React.useMemo<Array<{ label: string; path: string; icon: string }>>(() => {
    switch (currentServiceName) {
      case SERVICE_NAMES.MEDIAS:
        return [
          {
            label: dictionary.common.NAVIGATION_PAGE.MEDIAS_LIST.TITLE,
            path: `/${currentLocale}${ROUTER_PATHS.DASHBOARD.MEDIA_LIST}`,
            icon: "solar:folder-with-files-line-duotone",
          },
          {
            label: dictionary.common.NAVIGATION_PAGE.MEDIAS_CREATE.TITLE,
            path: `/${currentLocale}${ROUTER_PATHS.DASHBOARD.MEDIA_CREATE}`,
            icon: "solar:add-folder-line-duotone",
          },
        ];
      case SERVICE_NAMES.NOTES:
        return [
          {
            label: dictionary.common.NAVIGATION_PAGE.NOTES_LIST.TITLE,
            path: `/${currentLocale}${ROUTER_PATHS.DASHBOARD.NOTES_LIST}`,
            icon: "solar:documents-line-duotone",
          },
          {
            label: dictionary.common.NAVIGATION_PAGE.NOTES_CREATE.TITLE,
            path: `/${currentLocale}${ROUTER_PATHS.DASHBOARD.NOTES_CREATE}`,
            icon: "solar:document-add-line-duotone",
          },
        ];
      case SERVICE_NAMES.WORKFLOWS:
        return [
          {
            label: dictionary.common.NAVIGATION_PAGE.WORKFLOW_LIST.TITLE,
            path: `/${currentLocale}${ROUTER_PATHS.DASHBOARD.WORKFLOW_LIST}`,
            icon: "solar:routing-3-line-duotone",
          },
          {
            label: dictionary.common.NAVIGATION_PAGE.WORKFLOW_CREATE.TITLE,
            path: `/${currentLocale}${ROUTER_PATHS.DASHBOARD.WORKFLOW_CREATE}`,
            icon: "solar:widget-add-line-duotone",
          },
        ];
      default:
        return [];
    }
  }, [dictionary, currentServiceName, currentLocale]);

  return (
    <Menu.List>
      {navItems.map((item) => {
        const { label, path, icon } = item;
        const isSelected = pathname.startsWith(path);
        return (
          <Menu.Item
            key={path}
            label={isCollapsed ? "" : label}
            Icon={<Icon icon={icon} width={32} style={{ transform: "translateX(8px" }} />}
            selected={isSelected}
            onClick={() => {
              if (isSelected) return;
              router.push(path);
            }}
            style={{ gap: 20, transition: "none" }}
          />
        );
      })}
    </Menu.List>
  );
});

DashboardNavMenu.displayName = "DashboardNavMenu";
export default DashboardNavMenu;
