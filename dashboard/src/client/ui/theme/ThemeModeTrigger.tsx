"use client";

import React from "react";

import { Icon, Theme } from "venomous-ui-react/components";

const ThemeModeTrigger = React.memo(() => {
  const { isDarkThemeMode, toggleThemeMode } = Theme.useThemeMode();

  return (
    <Icon
      icon={isDarkThemeMode ? "solar:moon-bold" : "solar:sun-bold"}
      width={24}
      onClick={toggleThemeMode}
      style={{
        cursor: "pointer",
      }}
    />
  );
});

ThemeModeTrigger.displayName = "ThemeModeTrigger";
export default ThemeModeTrigger;
