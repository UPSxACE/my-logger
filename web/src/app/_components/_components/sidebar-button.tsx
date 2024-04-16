"use client";
import { UnstyledButton } from "@mantine/core";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentPropsWithoutRef, ReactElement, useContext } from "react";
import { IconType } from "react-icons";
import { AppShellContext } from "../app-shell";

interface SidebarButtonProps extends ComponentPropsWithoutRef<"a"> {
  className?: string;
  Icon: ReactElement<IconType>;
  navlink?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  active?: boolean;
}

export default function SidebarButton({
  children,
  className,
  Icon,
  navlink,
  onClick,
  active,
}: SidebarButtonProps) {
  const pathname = usePathname();
  const route = pathname.slice(1);
  const buttonActive = active
    ? active
    : typeof navlink === "string" && route.split("/")[0] === navlink;
  const { navbarCollapsed } = useContext(AppShellContext);

  const extraProps =
    typeof navlink === "string"
      ? {
          component: Link,
          href: "/" + navlink,
        }
      : {
          href: "",
          onClick,
        };

  return (
    <UnstyledButton
      {...extraProps}
      className={clsx(
        "group w-full overflow-hidden rounded-md font-semibold",
        className,
      )}
    >
      <div
        className={clsx(
          "flex w-full items-center",
          buttonActive
            ? "font-semibold text-mantine-primary-9"
            : "bg-transparent text-mantine-gray-7",
        )}
      >
        <div
          className={clsx(
            "mr-3 flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-lg p-2 transition-all duration-300",
            buttonActive
              ? "bg-mantine-primary-7 text-white"
              : "text-mantine-[#777d83] bg-mantine-gray-3 group-hover:bg-mantine-primary-3 group-hover:text-white",
          )}
        >
          <span className="flex items-center text-xl">{Icon}</span>
        </div>
        <span
          className={clsx(
            "flex items-center text-sm transition-all duration-300",
            buttonActive
              ? "text-mantine-primary-9"
              : "text-[#777d83] group-hover:text-mantine-primary-3",
          )}
        >
          {children}
        </span>
      </div>
    </UnstyledButton>
  );
}
