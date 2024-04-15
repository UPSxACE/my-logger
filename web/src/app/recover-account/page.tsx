"use client";
import ErrorAlert from "@/components/alerts/error-alert";
import { REGEX_PASSWORD } from "@/regexps";
import { Button, LoadingOverlay, PasswordInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import { LiaTimesCircleSolid } from "react-icons/lia";

export default function RecoverAccountPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { code } = searchParams;

  const [overlay, setOverlay] = useState(false);
  const [error, setError] = useState("");
  const [submited, setSubmited] = useState(false);
  const [invalid, setInvalid] = useState(false);

  const form = useForm({
    initialValues: {
      new_password: "",
      confirm_new_password: "",
    },
    validate: {
      new_password: (val) => {
        if (val.length < 8)
          return "Password should include at least 8 characters";
        if (val.length > 64) return "Password is too long";
        if (!REGEX_PASSWORD.test(val))
          return "Password must include at least 1 uppercase letter, 1 lowercase letter and 1 number";
        return null;
      },
      confirm_new_password: (val, values) =>
        val === values.new_password ? null : "The passwords don't match",
    },
  });

  async function handleRecoverAccount() {
    if (overlay) return;
    setOverlay(true);
    axios
      .post(
        process.env.NEXT_PUBLIC_API_URL + "/api/recover-account",
        {
          new_password: form.values.new_password,
        },
        {
          params: {
            code,
          },
        },
      )
      .then(() => {
        setOverlay(false);
        setSubmited(true);
      })
      .catch((err) => {
        if (err?.response?.status === 400) {
          setError("Try again later.");
          setOverlay(false);
          return;
        }
        if (err?.response?.status === 404) {
          setInvalid(true);
          setOverlay(false);
          return;
        }
        setError("Try again later.");
        setOverlay(false);
      });
  }

  if (submited) {
    return (
      <main className="flex min-h-screen w-screen flex-col items-center justify-center bg-mantine-gray-1 p-1">
        <section className="relative w-full max-w-[420px] rounded-md border border-solid border-stone-300 bg-white p-8 pt-6">
          <h1 className="m-0 text-center text-xl">Password Changed</h1>
          <p className="m-0 mt-2 text-center">
            Your password has been changed successefully. You can now{" "}
            <Link href="/" className="text-mantine-blue-8">
              login
            </Link>{" "}
            with your updated credentials.
          </p>
        </section>
      </main>
    );
  }

  if (!code || invalid) {
    return (
      <main className="flex min-h-screen w-screen flex-col items-center justify-center gap-2 bg-mantine-gray-1 p-1">
        <LiaTimesCircleSolid className="text-9xl text-mantine-red-9" />
        <h1 className="m-0 text-center text-3xl font-normal">
          Your recovery link has expired
        </h1>
        <p className="text-md m-0 text-center">
          Looks like the recovery link has expired. Request another one, and if
          the error persists, please contact the support.
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen w-screen flex-col items-center justify-center bg-mantine-gray-1 p-1">
      <section className="relative w-full max-w-[420px] rounded-md border border-solid border-stone-300 bg-white p-8 pt-6">
        <LoadingOverlay
          visible={overlay}
          className="z-[99] rounded-md"
          zIndex={99}
          overlayProps={{ blur: 2 }}
          loaderProps={{ type: "bars" }}
        />

        <form
          className="flex flex-col gap-4"
          onSubmit={form.onSubmit(handleRecoverAccount)}
        >
          <h1 className="m-0 text-center text-xl">Reset Password</h1>
          <ErrorAlert title={error} visible={error != ""} />
          <PasswordInput
            required
            label="New Password"
            placeholder="Your new password"
            value={form.values.new_password}
            onChange={(event) =>
              form.setFieldValue("new_password", event.currentTarget.value)
            }
            error={form.errors.new_password}
            radius="md"
          />

          <PasswordInput
            required
            label="Confirm New Password"
            placeholder="Your new password"
            value={form.values.confirm_new_password}
            onChange={(event) =>
              form.setFieldValue(
                "confirm_new_password",
                event.currentTarget.value,
              )
            }
            error={form.errors.confirm_new_password}
            radius="md"
          />

          <div className="flex flex-wrap items-center gap-4">
            <Link
              // variant="transparent"
              href="/"
              className="p-0 text-xs font-normal !text-mantine-dimmed no-underline hover:underline"
            >
              Back to login
            </Link>
            <Button className="ml-auto" type="submit" radius="xl">
              Submit
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
