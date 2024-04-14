"use server";
import { cookies } from "next/headers";
import "server-only";

export default function isLoggedIn() {
  const cookieStore = cookies();
  const loggedIn =
    cookieStore.has("my-loggerToken") &&
    cookieStore.get("my-loggerToken")?.value !== "";

  return loggedIn;
}
