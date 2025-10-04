"use client";

import React from "react";

import { Icon, Theme } from "venomous-ui-react/components";

const ThemeModeTrigger = React.memo<{
  style?: React.CSSProperties;
}>(({ style }) => {
  const { isDarkThemeMode, toggleThemeMode } = Theme.useThemeMode();

  return (
    <Icon
      icon={isDarkThemeMode ? "solar:moon-bold" : "solar:sun-bold"}
      width={24}
      onClick={toggleThemeMode}
      style={{
        cursor: "pointer",
        ...style,
      }}
    />
  );
});

ThemeModeTrigger.displayName = "ThemeModeTrigger";
export default ThemeModeTrigger;
