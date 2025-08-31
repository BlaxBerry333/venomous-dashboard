"use client";

import React from "react";

import { NoSSR, Notification, Theme } from "venomous-ui-react/components";
import { ThemeColor } from "venomous-ui-react/utils";

const ThemeProvider = React.memo<React.PropsWithChildren>(({ children }) => {
  return (
    <NoSSR>
      <Theme.Provider defaultThemeColor={ThemeColor.TurquoiseFerDeLance}>
        <Theme.InjectToHTML />

        {children}

        <Notification />
      </Theme.Provider>
    </NoSSR>
  );
});

ThemeProvider.displayName = "ThemeProvider";
export default ThemeProvider;
