"use client";

import React from "react";

import { NoSSR, Notification, Theme } from "venomous-ui-react/components";
import { THEME_COLORS } from "venomous-ui-react/utils/design";

const ThemeProvider = React.memo<React.PropsWithChildren>(({ children }) => {
  return (
    <NoSSR>
      <Theme.Provider defaultThemeColor={THEME_COLORS.TurquoiseFerDeLance}>
        <Theme.InjectToHTML />

        {children}

        <Notification />
      </Theme.Provider>
    </NoSSR>
  );
});

ThemeProvider.displayName = "ThemeProvider";
export default ThemeProvider;
