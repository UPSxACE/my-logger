"use client";
import useRequestNotification from "@/hooks/use-request-notification";
import Socket from "@/socket";
import { notifications } from "@mantine/notifications";
import { ReactNode, createContext, useEffect, useRef, useState } from "react";
import ConfigChanged from "./config-changed";

interface ISocketContext {
  socket: Socket | null;
  connected: boolean;
  error: boolean;
}

const defaultValue: ISocketContext = {
  socket: null,
  connected: false,
  error: false,
};

export const SocketContext = createContext<ISocketContext>(defaultValue);

export default function SocketProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(false);
  const [configUpdated, setConfigUpdated] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  const socket = useRef<Socket | null>(null);
  const lastReconnectNotif = useRef<null | string>(null);

  const { newNotification, updateToFatal, newFatalNotification } =
    useRequestNotification();

  useEffect(() => {
    const handleConnect = (e: MessageEvent) => {
      setConnected(true);
      setError(false);
      setReconnectCount(0);
      notifications.hide(lastReconnectNotif.current || "");
      lastReconnectNotif.current = null;
    };
    // e: MessageEvent
    const handleError = () => {
      setConnected(false);
      setError(true);
    };

    const handleConfigUpdate = (e: MessageEvent) => {
      setConfigUpdated(true);
    };

    const handleDisconnect = (e: MessageEvent) => {
      handleError();
      setConnected(false);
    };

    let timeout: NodeJS.Timeout;

    function retry() {
      if (reconnectCount >= 3) {
        const lastNotifId = lastReconnectNotif.current;

        if (!lastNotifId) {
          newFatalNotification(
            "socket-fatal",
            "Failed to reconnect",
            "You have lost connection to our servers. Please refresh the page to avoid bugs.",
          );
        } else {
          updateToFatal(
            lastNotifId,
            "Failed to reconnect",
            "You have lost connection to our servers. Please refresh the page to avoid bugs.",
          );
        }

        return;
      }

      if (lastReconnectNotif.current === null) {
        lastReconnectNotif.current = newNotification(
          "socket-error",
          "Lost connection",
          "Trying to reconnect...",
        );
      }

      timeout = setTimeout(() => {
        const newSocket = new Socket(
          process.env.NEXT_PUBLIC_SOCKET_URL + "/api/ws",
        );
        socket.current = newSocket;
        setReconnectCount((val) => val + 1);
      }, 3000);
    }

    if (error) {
      retry();
    }

    if (socket.current === null) {
      const newSocket = new Socket(
        process.env.NEXT_PUBLIC_SOCKET_URL + "/api/ws",
      );
      socket.current = newSocket;
    }
    socket.current.open();
    socket.current.on("connect", handleConnect);
    socket.current.on("error", handleError);
    socket.current.on("disconnect", handleDisconnect);
    socket.current.on("realtime:configupdate", handleConfigUpdate);

    return () => {
      socket?.current?.off("connect", handleConnect);
      socket?.current?.off("error", handleError);
      socket?.current?.off("disconnect", handleDisconnect);
      socket?.current?.off("realtime:configupdate", handleConfigUpdate);
      socket?.current?.close();
      clearTimeout(timeout);
    };
  }, [
    error,
    newFatalNotification,
    newNotification,
    reconnectCount,
    updateToFatal,
  ]);

  return (
    <SocketContext.Provider
      value={{ socket: socket.current, connected, error }}
    >
      <ConfigChanged opened={configUpdated} />
      {children}
    </SocketContext.Provider>
  );
}
