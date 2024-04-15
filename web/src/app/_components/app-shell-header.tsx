"use client";
import {
  Avatar,
  Menu,
  MenuDropdown,
  MenuItem,
  MenuTarget,
  UnstyledButton,
} from "@mantine/core";
import clsx from "clsx";
import { signOut } from "next-auth/react";
import { useContext } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import { RiLogoutBoxLine } from "react-icons/ri";
import { AppShellContext } from "./app-shell";

export default function AppShellHeader() {
  const { navbarCollapsed } = useContext(AppShellContext);

  return (
    <header
      className={clsx(
        "flex h-[70px] items-center border-0 border-b border-solid border-b-stone-200 border-opacity-70",
        navbarCollapsed ? "pl-[70px]" : "pl-[300px]",
      )}
    >
      <div className="flex flex-1 items-center p-2">
        <Menu>
          <MenuTarget>
            <UnstyledButton className="ml-auto flex h-full flex-col justify-center text-xl">
              <Avatar
                radius="xl"
                size="lg"
                classNames={{
                  root: "h-auto w-auto min-w-0 min-h-0",
                  placeholder: "bg-transparent text-mantine-gray-5", //"bg-transparent",
                  image: "h-[2.375rem] w-[2.375rem]",
                }}
                src={null}
              >
                <IoPersonCircleOutline size={40} />
              </Avatar>
            </UnstyledButton>
          </MenuTarget>
          <MenuDropdown>
            <MenuItem
              leftSection={
                <RiLogoutBoxLine className="pt-[0.05rem] text-base" />
              }
              className="flex items-center py-1 text-base font-normal"
              classNames={{ itemLabel: "pb-[0.05rem]" }}
              onClick={() => signOut()}
            >
              Logout
            </MenuItem>
          </MenuDropdown>
        </Menu>
      </div>
    </header>
  );
}
