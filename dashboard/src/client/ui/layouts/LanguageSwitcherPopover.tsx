"use client";

import { useRouter } from "next/navigation";
import React from "react";

import { Icon, Menu, Popover, Space } from "venomous-ui-react/components";

import { i18n, useI18nLocale } from "@/utils/i18n/index.client";

const LanguageSwitcherPopover = React.memo<{
  triggerHeight?: number;
}>(({ triggerHeight }) => {
  const router = useRouter();

  const { currentLocale, currentLocalOption, getTargetLocaleOption, getReplacedPathnameWithTargetLocale } = useI18nLocale();

  if (!currentLocalOption) {
    return null;
  }

  return (
    <Popover
      trigger="click"
      placement="bottom"
      content={
        <Menu.List>
          {i18n.locales.map((locale) => {
            const option = getTargetLocaleOption(locale);
            const targetPathname = getReplacedPathnameWithTargetLocale(locale);
            if (!option) return null;
            return (
              <Menu.Item
                key={option.value}
                Icon={<Icon icon={option.icon} />}
                label={option.label}
                selected={option.value === currentLocale}
                onClick={() => {
                  if (locale === currentLocale) return;
                  router.push(targetPathname);
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
          style={{
            height: triggerHeight,
            width: "max-content",
            cursor: "pointer",
          }}
        >
          <Icon icon={currentLocalOption.icon} />
        </Space.Flex>
      )}
    </Popover>
  );
});

LanguageSwitcherPopover.displayName = "LanguageSwitcher";
export default LanguageSwitcherPopover;
