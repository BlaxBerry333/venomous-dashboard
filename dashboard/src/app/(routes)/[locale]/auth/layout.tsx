"use client";

import React from "react";

import { Box, Layout, ScrollToTop, Space } from "venomous-ui-react/components";

import { SERVICE_NAMES } from "@/client/routes/paths";
import { LanguageSwitcherPopover, Logo, ThemeModeTrigger } from "@/client/ui";

const HEADER_HEIGHT: number = 60;
const LAYOUT_SPACE: number = 16;

const AuthRootLayout = React.memo<React.PropsWithChildren>(({ children }) => {
  return (
    <>
      <Layout.Header
        style={{
          height: HEADER_HEIGHT,
          padding: `0 ${LAYOUT_SPACE}px`,
          backgroundColor: "transparent",
          backdropFilter: "blur(10px)",
        }}
        Logo={<Logo serviceName={SERVICE_NAMES.DASHBOARD} size={HEADER_HEIGHT / 1.5} />}
        Menu={
          <Space.Flex spacing={24} style={{ height: "100%", justifyContent: "flex-end", flex: 1 }}>
            <ThemeModeTrigger />
            <LanguageSwitcherPopover triggerHeight={HEADER_HEIGHT} />
          </Space.Flex>
        }
      />

      <Box
        as="main"
        style={{
          minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
          flexGrow: 1,
          padding: `${LAYOUT_SPACE}px ${LAYOUT_SPACE * 2}px`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}

        <ScrollToTop distance={200} style={{ bottom: HEADER_HEIGHT }} />
      </Box>
    </>
  );
});

AuthRootLayout.displayName = "AuthRootLayout";
export default AuthRootLayout;
