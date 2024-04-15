import { config } from "@/auth";
import SessionContext from "@/components/session-context";
import SingleThemeScript from "@/components/single-theme-script";
import QueryClientProvider from "@/contexts/query-client-provider";
import {
  AppShellMain,
  ColorSchemeScript,
  MantineProvider,
} from "@mantine/core";
import "@mantine/core/styles.css";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { Inter } from "next/font/google";
import { theme } from "../theme";
import AppShell from "./_components/app-shell";
import AppShellHeader from "./_components/app-shell-header";
import AppShellSidebar from "./_components/app-shell-sidebar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyLogger",
  description: "Logging and web traffic analysis",
};

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
      <body>
        <SessionContext session={session}>
          <QueryClientProvider>
            <MantineProvider
              theme={theme}
              defaultColorScheme="light"
              forceColorScheme="light"
            >
              {session ? (
                <AppShell>
                  <AppShellSidebar />
                  <AppShellHeader />
                  <AppShellMain
                    className="flex flex-col bg-[#f6f6f6]"
                    style={{
                      minHeight: "calc(100svh - 70px)",
                    }}
                  >
                    <div className="flex-1 p-4">{children}</div>
                  </AppShellMain>
                </AppShell>
              ) : (
                children
              )}
            </MantineProvider>
          </QueryClientProvider>
        </SessionContext>
      </body>
    </html>
  );
}
