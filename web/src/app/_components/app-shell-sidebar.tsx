"use client";
import Logo from "@/components/logo";
import { Anchor, AppShellNavbar } from "@mantine/core";
import Link from "next/link";
import { useContext } from "react";
import {
  AiOutlineBlock,
  AiOutlineFileText,
  AiOutlineHome,
} from "react-icons/ai";
import { GiBrassEye } from "react-icons/gi";
import { GoChevronLeft } from "react-icons/go";
import { GrAppsRounded } from "react-icons/gr";
import { LiaKeySolid } from "react-icons/lia";
import SidebarButton from "./_components/sidebar-button";
import { AppShellContext } from "./app-shell";

export default function AppShellSidebar() {
  const { navbarCollapsed, setNavbarCollapsed } = useContext(AppShellContext);

  // TODO: listen to ctrl+alt key to toggle navbar collapse

  function toggleNavbarCollapse() {
    setNavbarCollapsed((val) => !val);
  }

  return (
    <AppShellNavbar
      style={{
        boxShadow:
          "rgba(27, 31, 35, 0.04) 0px 0px 0px, rgba(255, 255, 255, 0.25) 1px 1px 0px inset",
      }}
      // border-r border-r-stone-200 border-opacity-70
      className="overflow-hidden border-0 transition-all duration-200"
    >
      <div className="absolute flex h-full w-[260px] flex-col">
        <header className="h-[4.5rem]">
          {navbarCollapsed ? (
            <Anchor
              component={Link}
              href="/"
              className="flex h-[4.5rem] w-[4rem] items-center justify-center"
            >
              <GiBrassEye
                className={"flex text-[2rem] text-mantine-primary-7"}
              />
            </Anchor>
          ) : (
            <Logo />
          )}
        </header>
        <nav className={"flex h-full flex-col gap-2 px-3 pb-3"}>
          {/* <h1 className="m-0 text-base text-mantine-gray-7">Category 1</h1> */}

          <SidebarButton Icon={<AiOutlineHome />} navlink="">
            Home
          </SidebarButton>
          <SidebarButton Icon={<AiOutlineBlock />} navlink="machines">
            Machines
          </SidebarButton>
          <SidebarButton Icon={<GrAppsRounded />} navlink="apps">
            Apps
          </SidebarButton>
          <SidebarButton Icon={<AiOutlineFileText />} navlink="logs">
            Logs
          </SidebarButton>
          <SidebarButton Icon={<LiaKeySolid />} navlink="api-keys">
            Api Keys
          </SidebarButton>
          <SidebarButton
            active={!navbarCollapsed}
            Icon={
              <GoChevronLeft
                style={{
                  transitionProperty: "transform",
                  transitionDuration: "200ms",
                  transform: navbarCollapsed
                    ? "rotate(-180deg)"
                    : "rotate(0deg)",
                }}
              />
            }
            className="mt-auto max-md:hidden"
            onClick={toggleNavbarCollapse}
          >
            Collapse
          </SidebarButton>
        </nav>
      </div>
    </AppShellNavbar>
  );
}
