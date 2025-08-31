"use client";

import React from "react";

import { Container, Layout } from "venomous-ui-react/components";

import { useDesign } from "@/client/styles/design";
import { LanguageSwitcher, Logo, ThemeModeTrigger } from "@/client/ui";

const AuthRootLayout = React.memo<React.PropsWithChildren>(({ children }) => {
  const design = useDesign();

  return (
    <Layout.Provider headerHeight={60}>
      <Layout.Header style={{ borderBottom: `1px solid ${design.colors.border[3]}` }}>
        <Container
          maxBreakpoint="lg"
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Logo serviceName="dashboard" size={40} />
          <ThemeModeTrigger />
          <LanguageSwitcher />
        </Container>
      </Layout.Header>

      <Layout.Content>
        <Container maxBreakpoint="md" style={{ padding: "40px 8px" }}>
          {children}
        </Container>
      </Layout.Content>
    </Layout.Provider>
  );
});

AuthRootLayout.displayName = "AuthRootLayout";
export default AuthRootLayout;
