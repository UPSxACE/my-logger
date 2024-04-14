"use client";

import { SessionProvider } from "next-auth/react";

export default function SessionContext({
  session,
  children,
}: {
  session: any;
  children: any;
}) {
  return (
    <SessionProvider session={session} basePath="/auth-api">
      {children}
    </SessionProvider>
  );
}
