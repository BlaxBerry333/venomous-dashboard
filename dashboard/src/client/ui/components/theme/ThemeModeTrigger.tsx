"use client";

import React from "react";

import { FormField, Theme } from "venomous-ui-react/components";

const ThemeModeTrigger = React.memo(() => {
  const { themeColor } = Theme.useThemeColor();
  const { isDarkThemeMode, toggleThemeMode } = Theme.useThemeMode();

  return <FormField.Switch checked={isDarkThemeMode} onChange={toggleThemeMode} style={{ backgroundColor: themeColor }} />;
});

ThemeModeTrigger.displayName = "ThemeModeTrigger";
export default ThemeModeTrigger;
