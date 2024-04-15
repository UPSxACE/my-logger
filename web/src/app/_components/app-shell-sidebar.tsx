"use client";
import Logo from "@/components/logo";
import { Anchor, AppShellNavbar } from "@mantine/core";
import Link from "next/link";
import { useContext } from "react";
import { GiBrassEye } from "react-icons/gi";
import { AppShellContext } from "./app-shell";

export default function AppShellSidebar() {
  const { navbarCollapsed } = useContext(AppShellContext);

  return (
    <AppShellNavbar className="overflow-hidden border-0 border-r border-r-stone-200 border-opacity-70">
      <div className="absolute flex h-full w-[300px] flex-col px-6">
        <header className="mb-auto h-[70px]">
          {navbarCollapsed ? (
            <Anchor component={Link} href="/">
              <GiBrassEye
                className={"flex text-[1.7rem] text-mantine-primary-7"}
              />
            </Anchor>
          ) : (
            <Logo />
          )}
        </header>
        <div className="py-4"></div>
      </div>
    </AppShellNavbar>
  );
}
