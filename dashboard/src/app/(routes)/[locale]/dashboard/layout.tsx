"use client";

import React from "react";

import { Box, IconButton, Layout, ScrollToTop, Space, Typography } from "venomous-ui-react/components";

import { AccountPopover, AuthGuard, DashboardNavMenu, LanguageSwitcherPopover, ServiceSwitcherPopover, ThemeModeTrigger } from "@/client/ui";

const HEADER_HEIGHT: number = 60;
const SIDE_EXPANDED_WIDTH: number = 280;
const SIDE_COLLAPSED_WIDTH: number = 80;
const LAYOUT_SPACE: number = 16;

const DashboardRootLayout = React.memo<React.PropsWithChildren>(({ children }) => {
  const [collapsedSide, setCollapsedSide] = React.useState<boolean>(false);

  return (
    <AuthGuard>
      <Layout.Header
        style={{
          height: HEADER_HEIGHT,
          padding: `0 ${LAYOUT_SPACE}px`,
          backgroundColor: "transparent",
          backdropFilter: "blur(10px)",
        }}
        Menu={
          <Space.Flex spacing={24} style={{ height: "100%", justifyContent: "flex-end", flex: 1 }}>
            <ServiceSwitcherPopover triggerHeight={HEADER_HEIGHT} />
            <div style={{ flexGrow: 1 }} />
            <ThemeModeTrigger />
            <LanguageSwitcherPopover triggerHeight={HEADER_HEIGHT} />
            <AccountPopover triggerHeight={HEADER_HEIGHT} />
          </Space.Flex>
        }
      />

      <Space.Flex style={{ paddingTop: HEADER_HEIGHT }}>
        <Layout.Side
          expandedWidth={SIDE_EXPANDED_WIDTH}
          collapsedWidth={SIDE_COLLAPSED_WIDTH}
          collapsible
          collapsed={collapsedSide}
          onCollapsedChange={setCollapsedSide}
          renderMenu={(isCollapsed) => <DashboardNavMenu isCollapsed={isCollapsed} />}
          renderCollapseButton={(isCollapsed, toggle) => (
            <IconButton
              icon={isCollapsed ? "solar:arrow-right-bold" : "solar:arrow-left-bold"}
              shape="square"
              onClick={toggle}
              style={{ position: "absolute", top: 8, right: 0, transform: "translateX(50%)", zIndex: 101 }}
            />
          )}
          style={{
            top: HEADER_HEIGHT,
            height: `calc(100dvh - ${HEADER_HEIGHT}px)`,
          }}
        />

        <Box
          as="main"
          style={{
            flexGrow: 1,
            marginLeft: collapsedSide ? SIDE_COLLAPSED_WIDTH : SIDE_EXPANDED_WIDTH,
            transition: "margin-left 0.25s ease-in-out",
          }}
        >
          <Box
            style={{
              width: "100%",
              minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
              padding: `${LAYOUT_SPACE}px ${LAYOUT_SPACE * 2}px`,
            }}
          >
            {children}
          </Box>

          <ScrollToTop distance={200} style={{ bottom: HEADER_HEIGHT }} />

          <Layout.Footer
            style={{ minHeight: HEADER_HEIGHT, backgroundColor: "transparent", backdropFilter: "blur(10px)" }}
            Copyright={
              <Typography.Text
                as="small"
                text={`© ${new Date().getFullYear()} Venomous Dashboard. All rights reserved.`}
                style={{ flex: 1, textAlign: "center" }}
              />
            }
          />
        </Box>
      </Space.Flex>
    </AuthGuard>
  );
});

DashboardRootLayout.displayName = "DashboardRootLayout";
export default DashboardRootLayout;
