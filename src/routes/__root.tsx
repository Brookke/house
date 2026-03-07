import { Outlet, createRootRoute } from "@tanstack/react-router";
import { MantineProvider, AppShell, ColorSchemeScript } from "@mantine/core";
import "@mantine/core/styles.css";
import { mantineTheme } from "../theme";

import "../styles.css";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <ColorSchemeScript defaultColorScheme="auto" />
      <MantineProvider theme={mantineTheme} defaultColorScheme="auto">
        <AppShell>
          <AppShell.Main>
            <Outlet />
          </AppShell.Main>
        </AppShell>
      </MantineProvider>
    </>
  );
}
