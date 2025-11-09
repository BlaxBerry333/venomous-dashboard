"use client";

import React from "react";

import { NoSSR, Notification, Theme } from "venomous-ui-react/components";
import { PALETTE_COLORS } from "venomous-ui-react/constants";

const ThemeProvider = React.memo<React.PropsWithChildren>(({ children }) => {
  return (
    <NoSSR>
      <Theme.Provider
        customDesigns={{
          PaletteColors: PALETTE_COLORS.MAMBA,
        }}
        customStyles={{
          Popover: {
            backgroundImage: "url('/assets/backgrounds/01.avif')",
            backgroundPosition: "center",
            backgroundSize: "cover",
          },
          Dialog: {
            backgroundImage: "url('/assets/backgrounds/01.avif')",
            backgroundPosition: "center",
            backgroundSize: "cover",
          },
          Drawer: {},
          MenuList: {
            padding: 8,
            gap: 8,
            minWidth: "max-content",
          },
        }}
      >
        <Theme.ResetCSSStyle />
        <Notification position="top-center" maxCount={5} offset={8} />

        <div id="root">{children}</div>
      </Theme.Provider>
    </NoSSR>
  );
});

ThemeProvider.displayName = "ThemeProvider";
export default ThemeProvider;
