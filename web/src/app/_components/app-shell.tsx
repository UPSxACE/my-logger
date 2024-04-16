"use client";
import { AppShell as AppShellMantine } from "@mantine/core";
import {
  Context,
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useState,
} from "react";

interface IAppShellContext {
  navbarCollapsed: boolean;
  setNavbarCollapsed: Dispatch<SetStateAction<boolean>>;
}

const defaultValue: IAppShellContext = {
  navbarCollapsed: false,
  setNavbarCollapsed: (action: SetStateAction<boolean>) => false,
};

export const AppShellContext: Context<IAppShellContext> =
  createContext(defaultValue);

export default function AppShell(props: { children: Readonly<ReactNode> }) {
  const [navbarCollapsed, setNavbarCollapsed] = useState(false);

  return (
    <AppShellContext.Provider
      value={{
        navbarCollapsed,
        setNavbarCollapsed,
      }}
    >
      <AppShellMantine
        header={{ height: { base: 0 } }}
        navbar={{
          width: {
            base: "4rem",
            md: navbarCollapsed ? "4rem" : 260,
          },
          breakpoint: 0,
          collapsed: { mobile: false, desktop: false },
        }}
        padding={0}
      >
        {props.children}
      </AppShellMantine>
    </AppShellContext.Provider>
  );
}
