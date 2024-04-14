"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export const dynamic = "force-dynamic";

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  async function login(e: any) {
    e.preventDefault();

    await signIn("credentials", {
      ...formData,
      redirect: false,
    })
      .then(async (res) => {
        if (res?.ok && res?.url) return (window.location.href = "/");
        if (res?.error) return console.log(res.error);
        console.log("???", res);
      })
      .catch((err) => console.log(err));
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={login}>
        <label>
          Username
          <input
            value={formData.username}
            onChange={(e) =>
              setFormData((formData) => ({
                ...formData,
                username: e.target.value,
              }))
            }
            name="username"
            type="text"
          />
        </label>
        <label>
          Password
          <input
            value={formData.password}
            onChange={(e) =>
              setFormData((formData) => ({
                ...formData,
                password: e.target.value,
              }))
            }
            name="password"
            type="password"
          />
        </label>
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}
