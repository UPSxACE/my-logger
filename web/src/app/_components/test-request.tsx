"use client";

import { Button } from "@mantine/core";
import axios from "axios";

export default function TestRequest() {
  function handleRequest() {
    axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/test", {
      withCredentials: true,
    });
  }

  return <Button onClick={handleRequest}>Send</Button>;
}
