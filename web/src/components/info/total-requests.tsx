import { SocketContext } from "@/contexts/socket-provider/socket-provider";
import { SocketData } from "@/socket";
import { ColorSwatch, Progress } from "@mantine/core";
import { useContext, useEffect, useState } from "react";

export default function TotalRequests() {
  const [state, setState] = useState({
    authenticated: 0,
    guest: 0,
  });

  const { socket, connected } = useContext(SocketContext);

  useEffect(() => {
    const updateTotalRequests = (messageData: SocketData) => {
      const sumVals = (obj: Record<string, number>) =>
        Object.values(obj).reduce((x, y) => x + y, 0);

      const newState = {
        authenticated: sumVals(messageData.authenticated),
        guest: sumVals(messageData.guest),
      };

      setState(newState);
    };

    if (connected && socket) {
      socket.emit("realtime:totalrequests:start", null);
      socket.on("realtime:totalrequests:update", updateTotalRequests);
    }

    return () => {
      socket?.off("realtime:totalrequests:update", updateTotalRequests);
    };
  }, [connected, socket]);

  let percentage = 0;

  if (state.authenticated > 0 && state.guest === 0) {
    percentage = 100;
  }
  if (state.guest > 0 && state.authenticated === 0) {
    percentage = 0;
  }
  if (state.guest === 0 && state.authenticated === 0) {
    percentage = 50;
  }
  if (state.guest > 0 && state.authenticated > 0) {
    percentage = Math.round(
      state.authenticated / state.authenticated + state.guest,
    );
  }

  return (
    <>
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <ColorSwatch size={"1rem"} color="var(--mantine-primary-color-5)" />
          <span className="m-0 pt-[0.15rem] text-xs font-semibold">
            Authenticated
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ColorSwatch size={"1rem"} color="#ffb23e" />
          <span className="m-0 pt-[0.15rem] text-xs font-semibold">
            Guest Session
          </span>
        </div>
      </div>
      {/* ffb23e */}

      <div className="flex flex-col gap-2">
        <Progress value={percentage} classNames={{ root: "bg-[#ffb23e]" }} />
        <div className="flex justify-between">
          <span className="m-0 text-xs font-medium">{percentage}%</span>
          <span className="m-0 text-xs font-medium">{100 - percentage}%</span>
        </div>
      </div>
      <span className="m-0 w-full text-center text-xs font-semibold">
        Total Requests
      </span>
    </>
  );
}
