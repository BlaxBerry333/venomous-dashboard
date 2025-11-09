"use client";

import React from "react";

import { IconButton } from "venomous-ui-react/components";
import { useThemeMode } from "venomous-ui-react/hooks";

const ThemeModeTrigger = React.memo(() => {
  const { isDarkMode, toggleThemeMode } = useThemeMode();

  return <IconButton variant="text" icon={isDarkMode ? "solar:moon-bold" : "solar:sun-bold"} onClick={toggleThemeMode} />;
});

ThemeModeTrigger.displayName = "ThemeModeTrigger";
export default ThemeModeTrigger;
