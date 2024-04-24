import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";

type IDynamicTitle = [string, Dispatch<SetStateAction<string>>];
const defaultValueTitle: IDynamicTitle = [
  "",
  (s: SetStateAction<string>) => "",
];
export const DynamicTitleContext =
  createContext<IDynamicTitle>(defaultValueTitle);

type IDynamicRightCorner = [ReactNode, Dispatch<SetStateAction<ReactNode>>];
const defaultValueRightCorner: IDynamicRightCorner = [
  null,
  (s: SetStateAction<ReactNode>) => null,
];
export const DynamicRightCornerContext = createContext<IDynamicRightCorner>(
  defaultValueRightCorner,
);

export default function DynamicChartCard({
  title,
  height,
  className,
  children,
  fixedHeight,
  rightPad,
  bottomFix,
  square,
}: {
  title?: string;
  height?: number | string;
  className?: string;
  children: ReactNode;
  fixedHeight?: boolean;
  rightPad?: string;
  bottomFix?: boolean;
  square?: boolean;
}) {
  const [dynamicTitle, setDynamicTitle] = useState(title || "");
  const [dynamicRightCorner, setDynamicRightCorner] = useState<ReactNode>(null);

  return (
    <DynamicTitleContext.Provider value={[dynamicTitle, setDynamicTitle]}>
      <DynamicRightCornerContext.Provider
        value={[dynamicRightCorner, setDynamicRightCorner]}
      >
        <div
          style={{
            minHeight: height,
            boxShadow:
              "rgba(27, 31, 35, 0.04) 0px 1px 0px, rgba(255, 255, 255, 0.25) 0px 1px 0px inset",
          }}
          className={twMerge(
            "relative flex flex-col rounded-md bg-white p-4",
            rightPad && "pr-8",
            className,
          )}
        >
          <div className="flex">
            {dynamicTitle && <h1 className="m-0 text-lg">{dynamicTitle}</h1>}
            <div className="ml-auto flex flex-col items-center">
              {dynamicRightCorner && dynamicRightCorner}
            </div>
          </div>
          <div
            className={twMerge(
              "relative  w-full flex-1 overflow-hidden",
              square ? "aspect-square" : "h-full",
            )}
          >
            {/* 110% width to hide weird renderization of gradients when updating the chart  */}
            <div
              className={twMerge(
                "absolute",
                square
                  ? "h-full"
                  : bottomFix
                    ? "h-[calc(100%+30px)]"
                    : "h-[calc(100%-10px)]",
                rightPad ? rightPad : "w-full",
              )}
            >
              {children}
            </div>
          </div>
        </div>
      </DynamicRightCornerContext.Provider>
    </DynamicTitleContext.Provider>
  );
}
