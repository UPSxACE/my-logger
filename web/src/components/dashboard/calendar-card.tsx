"use client";
import { Calendar } from "@mantine/dates";
import dayjs from "dayjs";
import { useState } from "react";

export default function CalendarCard() {
  const [selected, setSelected] = useState<Date>(new Date(Date.now()));

  return (
    <div
      style={{
        boxShadow:
          "rgba(27, 31, 35, 0.04) 0px 1px 0px, rgba(255, 255, 255, 0.25) 0px 1px 0px inset",
      }}
      className="rounded-md bg-white p-4"
    >
      <Calendar
        onDateChange={(date) => setSelected(date)}
        getDayProps={(date) => ({
          outside:
            dayjs(date).isBefore(Date.now(), "day") ||
            !dayjs(date).isSame(selected, "month"),
          selected: dayjs(date).isSame(Date.now(), "day"),
        })}
        size={"sm"}
      />
    </div>
  );
}
