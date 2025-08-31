"use client";

import Link from "next/link";
import React from "react";

import { Icon, Menu, Popover, Space, Typography } from "venomous-ui-react/components";

import { useDesign } from "@/client/styles/design";
import { i18n, useI18nLocale } from "@/utils/i18n/index.client";

const LanguageSwitcher = React.memo(() => {
  const design = useDesign();

  const { currentLocale, currentLocalOption, getTargetLocaleOption, getReplacedPathnameWithTargetLocale } = useI18nLocale();

  if (!currentLocalOption) {
    return null;
  }

  return (
    <Popover
      trigger="click"
      alignment="center"
      direction="bottom"
      contentStyle={{ width: "160px" }}
      renderTrigger={() => (
        <Space.Flex row gap={4} style={{ width: "160px", height: 60, alignItems: "center", cursor: "pointer", padding: "0 16px" }}>
          <Icon icon={currentLocalOption.icon} width={24} style={{ border: `1px solid ${design.colors.border[3]}` }} />
          <Typography.Text as="strong" text={currentLocalOption.label} style={{ transform: "translateY(2px)" }} />
        </Space.Flex>
      )}
    >
      <Menu.List>
        {i18n.locales.map((locale, index) => {
          const option = getTargetLocaleOption(locale);
          const targetPathname = getReplacedPathnameWithTargetLocale(locale);
          if (!option) return null;
          return (
            <Link
              key={option.value}
              href={targetPathname}
              onClick={(e) => {
                if (locale === currentLocale) {
                  e.preventDefault();
                }
              }}
            >
              <Menu.Item
                icon={option.icon}
                id={option.value}
                text={option.label}
                isActive={option.value === currentLocale}
                style={{ cursor: "pointer", marginBottom: index === i18n.locales.length - 1 ? "0" : "4px" }}
              />
            </Link>
          );
        })}
      </Menu.List>
    </Popover>
  );
});

LanguageSwitcher.displayName = "LanguageSwitcher";
export default LanguageSwitcher;
