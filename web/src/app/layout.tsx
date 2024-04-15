import { config } from "@/auth";
import SessionContext from "@/components/session-context";
import SingleThemeScript from "@/components/single-theme-script";
import QueryClientProvider from "@/contexts/query-client-provider";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { Inter } from "next/font/google";
import { theme } from "../theme";
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
              {children}
            </MantineProvider>
          </QueryClientProvider>
        </SessionContext>
      </body>
    </html>
  );
}
