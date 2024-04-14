"use client";

import { Button } from "@mantine/core";
import axios from "axios";

export default function TestRequest() {
  function handleRequest() {
    axios.get("http://localhost:1323/api/test", {
      withCredentials: true,
    });
  }

  return <Button onClick={handleRequest}>Send</Button>;
}
