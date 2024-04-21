import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export default function StatCard({
  height,
  icon,
  value,
  name,
  className,
}: {
  height?: number | string;
  icon: ReactNode;
  value: string | ReactNode;
  name: string;
  className?: string;
}) {
  return (
    <div
      style={{
        minHeight: height,
        boxShadow:
          "rgba(27, 31, 35, 0.04) 0px 1px 0px, rgba(255, 255, 255, 0.25) 0px 1px 0px inset",
      }}
      className={twMerge(
        "flex flex-col items-start  rounded-md bg-white p-4",
        className,
      )}
    >
      <div className="flex items-center justify-center rounded-full bg-mantine-gray-1 p-3">
        <span className="m-0 flex items-center justify-center text-2xl text-mantine-primary-7">
          {icon}
        </span>
      </div>
      <span className="m-0 mt-auto line-clamp-1 text-xl text-mantine-text">
        {name}
      </span>
      <span className="m-0 mt-[0.1rem] text-4xl font-semibold text-mantine-text">
        {value}
      </span>
    </div>
  );
}
