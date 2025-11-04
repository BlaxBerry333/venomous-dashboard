"use client";

import React from "react";

import { Container, Layout } from "venomous-ui-react/components";
import { useDesign } from "venomous-ui-react/hooks";

import { AccountPopover, DashboardNavMenu, LanguageSwitcherPopover, ServiceSwitcherPopover, ThemeModeTrigger } from "@/client/ui";

const DashboardRootLayout = React.memo<React.PropsWithChildren>(({ children }) => {
  const design = useDesign();

  return (
    <Layout.Provider headerHeight={60} sideWidth={200}>
      <Layout.Header style={{ borderBottom: `1px solid ${design.BorderColors.tertiary}` }}>
        <Container
          maxBreakpoint="xl"
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
            padding: "0 8px",
          }}
        >
          <ServiceSwitcherPopover triggerHeight={60} />
          <div style={{ flexGrow: 1 }} />
          <LanguageSwitcherPopover triggerHeight={60} />
          <ThemeModeTrigger />
          <AccountPopover triggerHeight={60} />
        </Container>
      </Layout.Header>

      <Container maxBreakpoint="xl" style={{ display: "flex", padding: "0 8px", gap: "24px" }}>
        <Layout.Side style={{ zIndex: 0 }}>
          <DashboardNavMenu />
        </Layout.Side>

        <Layout.Content style={{ padding: "8px 0" }}>{children}</Layout.Content>
      </Container>
    </Layout.Provider>
  );
});

DashboardRootLayout.displayName = "DashboardRootLayout";
export default DashboardRootLayout;
