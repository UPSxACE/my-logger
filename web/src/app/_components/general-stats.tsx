"use client";

import StatCard from "@/components/dashboard-ui/stat-card";
import { SocketContext } from "@/contexts/socket-provider/socket-provider";
import { SocketData } from "@/socket";
import { useContext, useEffect, useState } from "react";
import { FaRegPaperPlane } from "react-icons/fa6";
import { FiUser } from "react-icons/fi";
import { LuNewspaper } from "react-icons/lu";
import { RiComputerLine } from "react-icons/ri";
import AnimatedNumbers from "./_components/animated-number";

export default function GeneralStats() {
  const [stats, setStats] = useState({
    total_visitors: 0,
    total_machine_logs: 0,
    total_analytics_logs: 0,
    total_request_logs: 0,
  });

  const { socket, connected } = useContext(SocketContext);

  useEffect(() => {
    const updateGeneralStats = (messageData: SocketData) => {
      setStats(messageData);
    };

    if (connected && socket) {
      socket.emit("realtime:generalstats:start", null);
      socket.on("realtime:generalstats:update", updateGeneralStats);
    }

    return () => {
      socket?.off("realtime:generalstats:update", updateGeneralStats);
    };
  }, [connected, socket]);

  return (
    <>
      <StatCard
        icon={<FiUser />}
        name="Total unique visitors"
        value={
          <AnimatedNumbers
            defaultNumber={0}
            targetNumber={stats.total_visitors}
          />
        }
      />
      <StatCard
        icon={<RiComputerLine />}
        name="Total machine logs"
        value={
          <AnimatedNumbers
            defaultNumber={0}
            targetNumber={stats.total_machine_logs}
          />
        }
      />

      <StatCard
        icon={<FaRegPaperPlane />}
        name="Total analytics logs"
        value={
          <AnimatedNumbers
            defaultNumber={0}
            targetNumber={stats.total_analytics_logs}
          />
        }
      />
      <StatCard
        icon={<LuNewspaper />}
        name="Total request logs"
        value={
          <AnimatedNumbers
            defaultNumber={0}
            targetNumber={stats.total_request_logs}
          />
        }
      />
    </>
  );
}
