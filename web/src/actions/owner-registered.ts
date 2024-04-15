"use server";

import axios from "axios";

let cache: boolean | null = false;

export default async function ownerRegistered() {
  if (cache) {
    return true;
  }

  await axios
    .get(process.env.NEXT_INTERNAL_API_URL + "/api/internal/owner-registered")
    .then((res) => {
      if (typeof res.data !== "boolean") {
        throw new Error("Unexpected response: ", res.data);
      }

      cache = res.data;
    })
    .catch((err) => {
      cache = null;
      console.log(err);
    });

  return cache;
}
