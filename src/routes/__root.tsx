import {
	Anchor,
	AppShell,
	ColorSchemeScript,
	Group,
	MantineProvider,
	Stack,
	Text,
} from "@mantine/core";
import { createRootRoute, Outlet } from "@tanstack/react-router";
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
					<Stack component={AppShell.Main} mih="100dvh" justify="space-between">
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
					</Stack>
				</AppShell>
			</MantineProvider>
		</>
	);
}
