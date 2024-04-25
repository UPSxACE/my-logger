import { SocketContext } from "@/contexts/socket-provider/socket-provider";
import { SocketData } from "@/socket";
import { Loader } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { BsExclamationCircleFill } from "react-icons/bs";

export default function MostRequestsChart() {
  const [state, setState] = useState<null | any[]>(null);
  // name data

  const { socket, connected, error } = useContext(SocketContext);

  const {
    error: dictionary_error,
    data: dictionary_data,
    isLoading: dictionary_isLoading,
  } = useQuery({
    queryKey: ["machine-dictionary"],
    queryFn: () =>
      axios
        .get(process.env.NEXT_PUBLIC_API_URL + "/api/machines", {
          withCredentials: true,
        })
        .then((res) => {
          const dictionary: Record<string, string> = {};

          res?.data?.forEach((machine: any) => {
            dictionary[machine.id] = machine.name;
          });

          return dictionary;
        }),
    retry: true,
    retryDelay: 1000,
    staleTime: Infinity,
  });

  useEffect(() => {
    const updateMostRequests = (messageData: SocketData) => {
      if (!dictionary_data) {
        return;
      }

      const newState: any[] = [];

      Object.keys(messageData).forEach((key) => {
        newState.push({
          name: dictionary_data[key],
          data: messageData[key],
        });
      });

      newState.sort((a, b) => a.data - b.data);

      setState(newState.slice(0, 3));
    };

    if (connected && socket) {
      socket.emit("realtime:mostrequests:start", null);
      socket.on("realtime:mostrequests:update", updateMostRequests);
    }

    return () => {
      socket?.off("realtime:mostrequests:update", updateMostRequests);
    };
  }, [connected, socket, dictionary_data]);

  if (state === null) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 py-8 opacity-100">
        <Loader />
      </div>
    );
  }

  if (state.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 py-8 opacity-100">
        <BsExclamationCircleFill size={60} className="text-mantine-cyan-6" />
      </div>
    );
  }

  return (
    <ReactApexChart
      series={state.map((obj) => obj.data)}
      options={{
        colors: [
          "var(--mantine-primary-color-3)",
          "var(--mantine-primary-color-5)",
          "var(--mantine-primary-color-9)",
        ],
        grid: {
          padding: {
            top: 20,
          },
        },
        stroke: {
          width: 0, // remove white line
        },
        chart: {
          type: "donut",
        },
        labels: state.map((obj) => obj.name),
        plotOptions: {
          pie: {
            donut: {
              size: "60%",
            },
            startAngle: -90,
            endAngle: 270,
          },
        },
        dataLabels: {
          enabled: false,
        },
        fill: {
          //   type: "gradient",
        },
        legend: {
          position: "bottom",
        },
      }}
      type="donut"
      height={"100%"}
      width={"100%"}
    />
  );
}
