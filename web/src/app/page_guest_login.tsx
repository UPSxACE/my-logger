"use client";
import ErrorAlert from "@/components/alerts/error-alert";
import {
  Button,
  LoadingOverlay,
  PasswordInput,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PageGuestLogin() {
  const [overlay, setOverlay] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const form = useForm({
    initialValues: {
      username: "",
      password: "",
    },

    validate: {},
  });

  async function handleLogin() {
    if (overlay) return;
    setOverlay(true);

    await signIn("credentials", {
      ...form.values,
      redirect: false,
    })
      .then(async (res) => {
        console.log(res);
        if (res?.ok && res?.url) return (window.location.href = "/");
        if (res?.error) {
          setError(res.error);
          return setOverlay(false);
        }
        console.log("???", res);
      })
      .catch((err) => console.log(err));
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
          onSubmit={form.onSubmit(handleLogin)}
        >
          <h1 className="m-0 text-center text-xl">Login</h1>
          <ErrorAlert title={error} visible={error != ""} />
          <TextInput
            required
            label="Username"
            placeholder="Your username"
            value={form.values.username}
            onChange={(event) =>
              form.setFieldValue("username", event.currentTarget.value)
            }
            radius="md"
            error={form.errors.username}
          />

          <PasswordInput
            required
            label="Password"
            placeholder="Your password"
            value={form.values.password}
            onChange={(event) =>
              form.setFieldValue("password", event.currentTarget.value)
            }
            error={form.errors.password}
            radius="md"
          />

          <div className="flex flex-wrap items-center gap-4">
            <Link
              // variant="transparent"
              href="/forgot-password"
              className="p-0 text-xs font-normal !text-mantine-dimmed no-underline hover:underline"
              onClick={() => {}}
            >
              Forgot your password?
            </Link>
            <Button className="ml-auto" type="submit" radius="xl">
              Login
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
