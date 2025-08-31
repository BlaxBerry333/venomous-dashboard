"use client";

import React from "react";

import { Theme } from "venomous-ui-react/components";
import { BorderColors, TextColors } from "venomous-ui-react/utils";

export function useDesign() {
  const { themeMode } = Theme.useThemeMode() as { themeMode: "light" | "dark" };

  const colors = React.useMemo(
    () => ({
      text: [TextColors[themeMode].primary, TextColors[themeMode].secondary, TextColors[themeMode].tertiary, TextColors[themeMode].quaternary],
      border: [BorderColors[themeMode].primary, BorderColors[themeMode].secondary, BorderColors[themeMode].tertiary, BorderColors[themeMode].quaternary],
    }),
    [themeMode],
  );

  return {
    colors,
  };
}
