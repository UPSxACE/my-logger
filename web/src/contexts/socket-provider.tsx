"use client";
import Socket from "@/socket";
import { ReactNode, createContext, useEffect, useRef, useState } from "react";

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
  const socket = useRef<Socket | null>(null);

  const handleConnect = (e: MessageEvent) => {
    setConnected(true);
    setError(false);
  };
  const handleError = (e: MessageEvent) => {
    setConnected(false);
    setError(true);
  };
  const handleDisconnect = (e: MessageEvent) => {
    setConnected(false);
    setError(false);
  };

  useEffect(() => {
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

    return () => {
      socket?.current?.off("connect", handleConnect);
      socket?.current?.off("error", handleError);
      socket?.current?.off("disconnect", handleDisconnect);
      socket?.current?.close();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{ socket: socket.current, connected, error }}
    >
      {children}
    </SocketContext.Provider>
  );
}
