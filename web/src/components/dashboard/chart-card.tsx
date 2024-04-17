import clsx from "clsx";
import { ReactNode } from "react";

export default function ChartCard({
  title,
  height,
  className,
  children,
  fixedHeight,
}: {
  title: string;
  height?: number | string;
  className?: string;
  children: ReactNode;
  fixedHeight?: boolean;
}) {
  return (
    <div
      style={{
        minHeight: height,
        boxShadow:
          "rgba(27, 31, 35, 0.04) 0px 1px 0px, rgba(255, 255, 255, 0.25) 0px 1px 0px inset",
      }}
      className={clsx(
        "relative flex flex-col rounded-md bg-white p-4 pr-8",
        className,
      )}
    >
      <h1 className="m-0 text-2xl">{title}</h1>
      <div className="relative h-full w-full flex-1 overflow-hidden">
        <div className="absolute h-[calc(100%-10px)] w-[110%]">{children}</div>
      </div>
    </div>
  );
}
