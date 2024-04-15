"use client";
import ErrorAlert from "@/components/alerts/error-alert";
import { REGEX_EMAIL, REGEX_PASSWORD, REGEX_USERNAME } from "@/regexps";
import {
  Button,
  LoadingOverlay,
  PasswordInput,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PageGuestRegister() {
  const [overlay, setOverlay] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleRegister() {
    if (overlay) return;
    setOverlay(true);
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/api/register", form.values)
      .then(() => {
        router.push("/confirmation-sent");
      })
      .catch((err) => {
        if (err?.response?.status === 400) {
          // NOTE: maybe use response?.field someday
          // NOTE: For now just show the same message
          setError("Try again later.");
          setOverlay(false);
          return;
        }
        setError("Try again later.");
        setOverlay(false);
      });
  }
  // [#dadce0]

  const form = useForm({
    initialValues: {
      username: "",
      email: "",
      password: "",
      repeat_password: "",
    },

    validate: {
      username: (val) => (REGEX_USERNAME.test(val) ? null : "Invalid username"),
      password: (val) => {
        if (val.length < 8)
          return "Password should include at least 8 characters";
        if (val.length > 64) return "Password is too long";
        if (!REGEX_PASSWORD.test(val))
          return "Password must include at least 1 uppercase letter, 1 lowercase letter and 1 number";
        return null;
      },
      email: (val) => (REGEX_EMAIL.test(val) ? null : "Invalid email"),
      repeat_password: (val, values) =>
        val === values.password ? null : "The passwords don't match",
    },
  });

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
          onSubmit={form.onSubmit(handleRegister)}
        >
          <h1 className="m-0 text-center text-xl">Register owner account</h1>
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
          <TextInput
            required
            label="Email"
            placeholder="example@example.com"
            value={form.values.email}
            onChange={(event) =>
              form.setFieldValue("email", event.currentTarget.value)
            }
            error={form.errors.email}
            radius="md"
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

          <PasswordInput
            required
            label="Repeat Password"
            placeholder="Your password"
            value={form.values.repeat_password}
            onChange={(event) =>
              form.setFieldValue("repeat_password", event.currentTarget.value)
            }
            error={form.errors.repeat_password}
            radius="md"
          />

          <div className="flex flex-wrap items-center gap-4 max-xs:flex-col">
            <Button className="xs:ml-auto" type="submit" radius="xl">
              Register
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
