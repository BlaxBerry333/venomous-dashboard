"use client";

import React from "react";

import { Container, Layout } from "venomous-ui-react/components";
import { useDesign } from "venomous-ui-react/hooks";

import { SERVICE_NAMES } from "@/client/routes/paths";
import { LanguageSwitcherPopover, Logo, ThemeModeTrigger } from "@/client/ui";

const AuthRootLayout = React.memo<React.PropsWithChildren>(({ children }) => {
  const design = useDesign();

  return (
    <Layout.Provider headerHeight={60}>
      <Layout.Header style={{ borderBottom: `1px solid ${design.BorderColors.tertiary}` }}>
        <Container
          maxBreakpoint="md"
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
            padding: "0 8px",
          }}
        >
          <Logo serviceName={SERVICE_NAMES.DASHBOARD} size={40} />
          <div style={{ flexGrow: 1 }} />
          <LanguageSwitcherPopover triggerHeight={60} />
          <ThemeModeTrigger />
        </Container>
      </Layout.Header>

      <Container maxBreakpoint="md" style={{ padding: "40px 8px" }}>
        <Layout.Content>{children}</Layout.Content>
      </Container>
    </Layout.Provider>
  );
});

AuthRootLayout.displayName = "AuthRootLayout";
export default AuthRootLayout;
