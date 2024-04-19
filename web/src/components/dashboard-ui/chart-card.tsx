import clsx from "clsx";
import { ReactNode } from "react";

export default function ChartCard({
  title,
  height,
  className,
  children,
  fixedHeight,
  rightPad,
  bottomFix,
  square,
}: {
  title: string;
  height?: number | string;
  className?: string;
  children: ReactNode;
  fixedHeight?: boolean;
  rightPad?: boolean;
  bottomFix?: boolean;
  square?: boolean;
}) {
  return (
    <div
      style={{
        minHeight: height,
        boxShadow:
          "rgba(27, 31, 35, 0.04) 0px 1px 0px, rgba(255, 255, 255, 0.25) 0px 1px 0px inset",
      }}
      className={clsx(
        "relative flex flex-col rounded-md bg-white p-4",
        rightPad && "pr-8",
        className,
      )}
    >
      <h1 className="m-0 text-lg">{title}</h1>
      <div
        className={clsx(
          "relative  w-full flex-1 overflow-hidden",
          square ? "aspect-square" : "h-full",
        )}
      >
        {/* 110% width to hide weird renderization of gradients when updating the chart  */}
        <div
          className={clsx(
            "absolute",
            square
              ? "h-full"
              : bottomFix
                ? "h-[calc(100%+30px)]"
                : "h-[calc(100%-10px)]",
            rightPad ? "w-[110%]" : "w-full",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
