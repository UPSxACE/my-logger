"use client";

import { MantineColorsTuple, createTheme } from "@mantine/core";

// Pale Purple
const mainColor: MantineColorsTuple = [
  "#f2f0ff",
  "#e0dff2",
  "#bfbdde",
  "#9b98ca",
  "#7d79ba",
  "#6a65b0",
  "#605bac",
  "#504c97",
  "#464388",
  "#3b3979"
];

export const theme = createTheme({
  /* Put your mantine theme override here */
  primaryColor: "mainColor",
  primaryShade: 4,
  colors: {
    mainColor,
  },
});
