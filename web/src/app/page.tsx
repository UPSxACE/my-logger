import { auth } from "@/auth";
import { Button } from "@mantine/core";
import Link from "next/link";
import LogoutButton from "./_components/logout-button";
import TestRequest from "./_components/test-request";

export default async function HomePage() {
  const sess = await auth();
  return (
    <main className="flex min-h-screen w-screen flex-col items-center justify-center">
      <h1>Hello World!</h1>
      <Button variant="outline" color="mainColor.4">
        Violet Button Hopefully
      </Button>
      {sess ? (
        <>
          <TestRequest />
          <LogoutButton />
        </>
      ) : (
        <Button component={Link} href="/login">
          Login
        </Button>
      )}
    </main>
  );
}
