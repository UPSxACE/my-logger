import { config } from "@/auth";
import SessionContext from "@/components/session-context";
import SingleThemeScript from "@/components/single-theme-script";
import QueryClientProvider from "@/contexts/query-client-provider";
import SocketProvider from "@/contexts/socket-provider/socket-provider";
import { WebVitals } from "@/webvitals";
import {
  AppShellMain,
  ColorSchemeScript,
  MantineProvider,
} from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { Montserrat } from "next/font/google";
import { theme } from "../theme";
import AppShell from "./_components/app-shell";
import AppShellHeader from "./_components/app-shell-header";
import AppShellSidebar from "./_components/app-shell-sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyLogger",
  description: "Logging and web traffic analysis",
};

const montserrat = Montserrat({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(config);
  return (
    <html lang="en" data-mantine-color-scheme="light">
      <head>
        <ColorSchemeScript
          defaultColorScheme="light"
          forceColorScheme="light"
        />
        <SingleThemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body className={montserrat.className}>
        <SessionContext session={session}>
          <QueryClientProvider>
            <MantineProvider
              theme={theme}
              defaultColorScheme="light"
              forceColorScheme="light"
            >
              <Notifications position="bottom-right" zIndex={1000} limit={5} />
              {session ? (
                <SocketProvider>
                  <AppShell>
                    <AppShellSidebar />
                    <AppShellHeader />
                    <AppShellMain
                      className="flex flex-col bg-[#f6f6f6]"
                      style={{
                        minHeight: "calc(100svh - 3.5rem)",
                      }}
                    >
                      <div className="flex flex-1 flex-col p-4">{children}</div>
                    </AppShellMain>
                  </AppShell>
                </SocketProvider>
              ) : (
                children
              )}
            </MantineProvider>
          </QueryClientProvider>
        </SessionContext>
        <WebVitals />
      </body>
    </html>
  );
}
