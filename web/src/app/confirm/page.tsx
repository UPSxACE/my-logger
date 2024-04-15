"use client";
import { Loader } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { LiaCheckCircleSolid, LiaTimesCircleSolid } from "react-icons/lia";

export default function ConfirmPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { code } = searchParams;

  const { status, error, isLoading } = useQuery({
    enabled: Boolean(code),
    queryKey: ["email-confirmation"],
    queryFn: () =>
      axios
        .post(process.env.NEXT_PUBLIC_API_URL + "/api/confirm-email", null, {
          params: {
            code,
          },
        })
        .then((res) => res.data),
    retry: false,
    staleTime: Infinity,
  });

  if (!code || (!isLoading && status !== "success")) {
    return (
      <main className="flex min-h-screen w-screen flex-col items-center justify-center gap-2 bg-mantine-gray-1 p-1">
        <LiaTimesCircleSolid className="text-9xl text-mantine-red-9" />
        <h1 className="m-0 text-center text-3xl font-normal">
          Your verification link has expired
        </h1>
        <p className="text-md m-0 text-center">
          Looks like the verification link has expired. If your account has not
          been activated yet, please contact the support.
        </p>
      </main>
    );
  }

  if (code && isLoading) {
    return (
      <main className="flex min-h-screen w-screen flex-col items-center justify-center bg-mantine-gray-1 p-1">
        <Loader />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen w-screen flex-col items-center justify-center gap-2 bg-mantine-gray-1 p-1">
      <LiaCheckCircleSolid className="text-9xl text-mantine-green-9" />
      <h1 className="m-0 text-center text-3xl font-normal">
        Account activated
      </h1>
      <p className="text-md m-0 text-center">
        Your email has been confirmed. You can now{" "}
        <Link href="/" className="text-mantine-blue-8">
          login
        </Link>{" "}
        to the application.
      </p>
    </main>
  );
}
