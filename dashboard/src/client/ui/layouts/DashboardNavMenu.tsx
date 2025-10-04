"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { Menu } from "venomous-ui-react/components";

import { getServiceNameFromPathname, ROUTER_PATHS } from "@/client/routes";
import { SERVICE_NAMES } from "@/client/routes/paths";
import { useI18nDictionary, useI18nLocale } from "@/utils/i18n/index.client";

const DashboardNavMenu = React.memo(() => {
  const dictionary = useI18nDictionary();
  const { currentLocale } = useI18nLocale();

  const pathname = usePathname();

  const currentServiceName = React.useMemo(() => getServiceNameFromPathname(pathname), [pathname]);

  const navItems = React.useMemo(() => {
    switch (currentServiceName) {
      case SERVICE_NAMES.MEDIA:
        return [
          {
            label: dictionary.common.NAVIGATION_PAGE_NAME.MEDIA_LIST,
            path: `/${currentLocale}${ROUTER_PATHS.DASHBOARD.MEDIA_LIST}`,
            icon: "solar:folder-with-files-line-duotone",
          },
          {
            label: dictionary.common.NAVIGATION_PAGE_NAME.MEDIA_CREATE,
            path: `/${currentLocale}${ROUTER_PATHS.DASHBOARD.MEDIA_CREATE}`,
            icon: "solar:add-folder-line-duotone",
          },
        ];
      case SERVICE_NAMES.NOTES:
        return [
          {
            label: dictionary.common.NAVIGATION_PAGE_NAME.NOTES_LIST,
            path: `/${currentLocale}${ROUTER_PATHS.DASHBOARD.NOTES_LIST}`,
            icon: "solar:documents-line-duotone",
          },
          {
            label: dictionary.common.NAVIGATION_PAGE_NAME.NOTES_CREATE,
            path: `/${currentLocale}${ROUTER_PATHS.DASHBOARD.NOTES_CREATE}`,
            icon: "solar:document-add-line-duotone",
          },
        ];
      case SERVICE_NAMES.WORKFLOW:
        return [
          {
            label: dictionary.common.NAVIGATION_PAGE_NAME.WORKFLOW_LIST,
            path: `/${currentLocale}${ROUTER_PATHS.DASHBOARD.WORKFLOW_LIST}`,
            icon: "solar:routing-3-line-duotone",
          },
          {
            label: dictionary.common.NAVIGATION_PAGE_NAME.WORKFLOW_CREATE,
            path: `/${currentLocale}${ROUTER_PATHS.DASHBOARD.WORKFLOW_CREATE}`,
            icon: "solar:widget-add-line-duotone",
          },
        ];
      default:
        return [];
    }
  }, [dictionary, currentServiceName, currentLocale]);

  return (
    <Menu.List style={{ padding: "8px" }}>
      {navItems.map((item, index) => {
        const { label, path, icon } = item;
        const isSelected = pathname.startsWith(path);
        return (
          <Link key={path} href={path}>
            <Menu.Item
              id={path}
              icon={icon}
              text={label}
              isActive={isSelected}
              style={{ marginBottom: index === navItems.length - 1 ? 0 : "8px", cursor: "pointer" }}
            />
          </Link>
        );
      })}
    </Menu.List>
  );

  return <div style={{ height: "200vh", backgroundColor: "crimson" }} />;
});

DashboardNavMenu.displayName = "DashboardNavMenu";
export default DashboardNavMenu;
