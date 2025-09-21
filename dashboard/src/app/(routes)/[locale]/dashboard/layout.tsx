"use client";

import React from "react";

import { Container, Layout } from "venomous-ui-react/components";
import { useDesign } from "venomous-ui-react/hooks";

import { LanguageSwitcherPopover, Logo, ThemeModeTrigger } from "@/client/ui";
import AccountPopover from "@/client/ui/layouts/AccountPopover";

const DashboardRootLayout = React.memo<React.PropsWithChildren>(({ children }) => {
  const design = useDesign();

  return (
    <Layout.Provider headerHeight={60}>
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
          <Logo serviceName="dashboard" size={40} />
          <div style={{ flexGrow: 1 }} />
          <LanguageSwitcherPopover triggerHeight={60} />
          <ThemeModeTrigger />
          <AccountPopover triggerHeight={60} />
        </Container>
      </Layout.Header>

      <Layout.Content>
        <Container maxBreakpoint="xl" style={{ padding: "0 8px" }}>
          {children}
        </Container>
      </Layout.Content>
    </Layout.Provider>
  );
});

DashboardRootLayout.displayName = "DashboardRootLayout";
export default DashboardRootLayout;
