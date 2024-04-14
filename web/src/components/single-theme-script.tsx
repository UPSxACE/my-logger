"use client";
import { useEffect } from "react";

export default function SingleThemeScript() {
  useEffect(() => {
    const theme = localStorage.getItem("mantine-color-scheme-value");
    if (theme) {
      localStorage.removeItem("mantine-color-scheme-value");
    }
  }, []);

  return null;
}
