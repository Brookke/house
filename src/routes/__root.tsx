import { Outlet, createRootRoute } from "@tanstack/react-router";
import {
  MantineProvider,
  AppShell,
  ColorSchemeScript,
  Text,
  Anchor,
  Group,
} from "@mantine/core";
import "@mantine/core/styles.css";
import { mantineTheme } from "../theme";

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
            <Group justify="center" p="xl">
              <Text>
                Made with{" "}
                <span aria-label="love" role="img">
                  💖
                </span>{" "}
                by{" "}
                <Anchor
                  href="https://brookehatton.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Brooke
                </Anchor>
              </Text>
            </Group>
          </AppShell.Main>
        </AppShell>
      </MantineProvider>
    </>
  );
}
