"use client";
import ErrorAlert from "@/components/alerts/error-alert";
import { REGEX_EMAIL } from "@/regexps";
import { Button, LoadingOverlay, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [overlay, setOverlay] = useState(false);
  const [error, setError] = useState("");
  const [submited, setSubmited] = useState(false);

  const form = useForm({
    initialValues: {
      email: "",
    },
    validate: {
      email: (val) => (REGEX_EMAIL.test(val) ? null : "Invalid email"),
    },
  });

  async function handleRestorePassword() {
    if (overlay) return;
    setOverlay(true);
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/api/forgot-password", null, {
        params: {
          email: form.values.email,
        },
      })
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
          setError("We couldn't find any account that matches that email.");
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
          <h1 className="m-0 text-center text-xl">Forgot Password</h1>
          <p className="m-0 mt-2 text-center">
            An email with a link to reset your password has been sent to your
            email. Please use it in the next 24 hours.
          </p>
        </section>
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
          onSubmit={form.onSubmit(handleRestorePassword)}
        >
          <h1 className="m-0 text-center text-xl">Forgot Password</h1>
          <ErrorAlert title={error} visible={error != ""} />
          <TextInput
            required
            label="Email"
            placeholder="Your email"
            value={form.values.email}
            onChange={(event) =>
              form.setFieldValue("email", event.currentTarget.value)
            }
            radius="md"
            error={form.errors.email}
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
