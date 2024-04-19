import clsx from "clsx";
import { ReactNode } from "react";

export default function BasicCard({
  height,
  className,
  children,
}: {
  height?: number | string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: height,
        boxShadow:
          "rgba(27, 31, 35, 0.04) 0px 1px 0px, rgba(255, 255, 255, 0.25) 0px 1px 0px inset",
      }}
      className={clsx("rounded-md bg-white p-4", className)}
    >
      {children}
    </div>
  );
}
