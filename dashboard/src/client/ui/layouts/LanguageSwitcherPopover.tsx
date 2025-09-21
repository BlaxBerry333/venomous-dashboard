"use client";

import Link from "next/link";
import React from "react";

import { Icon, Menu, Theme } from "venomous-ui-react/components";

import { i18n, useI18nLocale } from "@/utils/i18n/index.client";
import CustomPopover from "../custom/CustomPopover";

const LanguageSwitcherPopover = React.memo<{
  triggerHeight: number;
}>(({ triggerHeight }) => {
  const { themeColor } = Theme.useThemeColor();

  const { currentLocale, currentLocalOption, getTargetLocaleOption, getReplacedPathnameWithTargetLocale } = useI18nLocale();

  if (!currentLocalOption) {
    return null;
  }

  return (
    <CustomPopover
      alignment="center"
      triggerStyle={{ height: triggerHeight }}
      renderTrigger={({ isOpen }) => (
        <Icon
          icon={currentLocalOption.icon}
          width={24}
          style={{
            ...(isOpen ? { outline: `2px solid ${themeColor}` } : {}),
          }}
        />
      )}
    >
      <React.Suspense>
        <Menu.List style={{ minWidth: "160px" }}>
          {i18n.locales.map((locale, index) => {
            const option = getTargetLocaleOption(locale);
            const targetPathname = getReplacedPathnameWithTargetLocale(locale);
            if (!option) return null;
            return (
              <Link
                key={option.value}
                href={targetPathname}
                onClick={(e) => {
                  if (locale === currentLocale) e.preventDefault();
                }}
              >
                <Menu.Item
                  icon={option.icon}
                  id={option.value}
                  text={option.label}
                  isActive={option.value === currentLocale}
                  style={{ cursor: "inherit", marginBottom: index === i18n.locales.length - 1 ? "0" : "4px" }}
                />
              </Link>
            );
          })}
        </Menu.List>
      </React.Suspense>
    </CustomPopover>
  );
});

LanguageSwitcherPopover.displayName = "LanguageSwitcher";
export default LanguageSwitcherPopover;
