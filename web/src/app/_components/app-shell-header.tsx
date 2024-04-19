"use client";
import {
  Anchor,
  Avatar,
  Breadcrumbs,
  Menu,
  MenuDropdown,
  MenuItem,
  MenuTarget,
  UnstyledButton,
} from "@mantine/core";
import clsx from "clsx";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import { GoChevronDown } from "react-icons/go";
import { IoPersonCircleOutline } from "react-icons/io5";
import { RiLogoutBoxLine } from "react-icons/ri";
import { AppShellContext } from "./app-shell";

export default function AppShellHeader() {
  const { navbarCollapsed } = useContext(AppShellContext);
  // const { searchFilter, setSearchFilter } = useContext(NotesContext);

  //  border-0 border-b border-solid border-b-stone-200

  const pathname = usePathname();
  const route = pathname.slice(1);
  const subpaths = route.split("/");
  const words = subpaths[0].split("-");
  const capitalizedWords = words.map((word) => {
    const firstLetter = word.charAt(0).toUpperCase();
    return firstLetter + word.slice(1);
  });
  const wordsTogether = capitalizedWords.join(" ");

  const items = [
    { title: "Dashboard", href: "/" },
    { title: wordsTogether || "Home", href: "#" },
  ].map((item, index) => (
    <Anchor
      href={item.href}
      key={index}
      className="text-xl font-semibold text-mantine-text hover:no-underline"
    >
      {item.title}
    </Anchor>
  ));

  return (
    <header
      className={clsx(
        "items-centerborder-opacity-70 flex h-[3.5rem] gap-2 bg-[#f6f6f6] transition-all duration-200",
        navbarCollapsed ? "pl-[4rem]" : "pl-[260px] max-md:pl-[4rem]",
      )}
    >
      <div className="flex flex-1 items-center gap-2 px-4 pt-4">
        {/* <TextInput
          // value={searchFilter}
          // onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Search"
          radius="sm"
          // style={{ boxShadow: "rgba(0, 0, 0, 0.04) 0px 3px 5px" }}
          // style={{ boxShadow: "rgba(0, 0, 0, 0.1) 0px 1px 2px 0px" }}
          style={{
            boxShadow:
              "rgba(27, 31, 35, 0.04) 0px 1px 0px, rgba(255, 255, 255, 0.25) 0px 1px 0px inset",
          }}
          // style={{
          //   boxShadow: "rgba(33, 35, 38, 0.1) 0px 10px 10px -10px",
          // }}
          className="max-w-[360px] flex-1"
          classNames={{ input: "border-0" }}
          leftSection={<RiSearchLine />}
        /> */}
        <Breadcrumbs classNames={{ separator: "text-xl font-semibold" }}>
          {items}
        </Breadcrumbs>

        <Menu offset={0} position="bottom-end" withArrow arrowOffset={8}>
          <UnstyledButton className="ml-auto flex h-full flex-col justify-center text-xl">
            <MenuTarget>
              <div className="flex items-center">
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

                <div className="flex h-[1.5rem] w-[1.5rem] items-center justify-center">
                  <GoChevronDown className="text-xl text-mantine-gray-7" />
                </div>
              </div>
            </MenuTarget>
            <MenuDropdown>
              <MenuItem
                leftSection={<RiLogoutBoxLine className="text-lg" />}
                className="flex items-center px-1 py-1 text-base font-normal"
                classNames={{ itemLabel: "", itemSection: "mr-1" }}
                onClick={() => signOut()}
              >
                Logout
              </MenuItem>
            </MenuDropdown>
          </UnstyledButton>
        </Menu>
      </div>
    </header>
  );
}
