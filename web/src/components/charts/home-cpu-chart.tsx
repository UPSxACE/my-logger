"use client";
import { SocketContext } from "@/contexts/socket-provider";
import { SocketData } from "@/socket";
import ApexCharts from "apexcharts";
import { useContext, useEffect, useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";

const X_AXIS_RANGE = 50;

// socket states
let data: any[] = [];
let lastIndexHeard = -1;

export default function HomeCpuChart() {
  const [initialLoad, setInitialLoad] = useState(false);

  const { socket, connected, error } = useContext(SocketContext);

  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = useRef<any>();
  const previousTimeRef = useRef<any>();

  useEffect(() => {
    const updateChart = (messageData: SocketData) => {
      // update
      if (
        connected &&
        socket &&
        messageData.last_heard_index > lastIndexHeard
      ) {
        let dif;
        const negativeIndex =
          lastIndexHeard === -1 || messageData.last_heard_index === -1;
        if (negativeIndex) {
          dif = messageData.chart_data.length;
        }
        if (!negativeIndex) {
          dif = messageData.last_heard_index - lastIndexHeard;
        }
        if (dif > 100) {
          dif = 100;
        }

        lastIndexHeard = messageData.last_heard_index;
        socket?.emit("chart1:update-received", lastIndexHeard);

        if (dif > 0) {
          data = [...data, ...messageData.chart_data.slice(-dif)];

          if (initialLoad) {
            ApexCharts.exec("realtime", "updateSeries", [
              {
                data,
              },
            ]);
          }
        }
      }
    };

    if (connected && socket) {
      const animate: FrameRequestCallback = (time) => {
        if (!initialLoad && data.length > 0) {
          setInitialLoad(true);
        }

        if (previousTimeRef.current != undefined) {
          const deltaTime = time - previousTimeRef.current;

          if (deltaTime >= 1000) {
            // NOTE: I could animate chart here instead of updateChart function

            previousTimeRef.current = time;
          }
        } else {
          previousTimeRef.current = time;
        }

        requestRef.current = requestAnimationFrame(animate);
      };

      socket.emit("chart1:start-listening", lastIndexHeard);
      socket.on("chart1:update", updateChart);

      requestRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (connected && socket) {
        socket.emit("chart1:stop-listening", null);
      }
      socket?.off("chart1:update", updateChart);
      cancelAnimationFrame(requestRef.current);

      // free up memory of unused data
      if (data.length > 100) {
        data = data.slice(-100);
      }
    };
  }, [socket, connected, initialLoad]);

  const options: ApexCharts.ApexOptions = {
    // responsive: [],
    fill: {
      type: "gradient",
      gradient: {
        type: "vertical",
        gradientToColors: [
          "var(--mantine-primary-color-4)",
          "var(--mantine-primary-color-7)",
        ],
        stops: [50, 100],
      },
    },
    chart: {
      id: "realtime",
      animations: {
        enabled: true,
        easing: "linear",
        dynamicAnimation: {
          speed: 1000,
        },
      },
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
    },
    // title: {
    //   text: "Dynamic Updating Chart",
    //   align: "left",
    // },
    markers: {
      size: 0,
    },
    xaxis: {
      type: "numeric",
      range: X_AXIS_RANGE,
    },
    yaxis: {
      min: 0,
      max: 100,
    },
    legend: {
      show: false,
    },
  };

  if (!connected || !initialLoad) {
    return null;
  }

  return (
    <ReactApexChart
      // className="h-full"
      options={options}
      series={[
        {
          name: "Desktops",
          data: data,
          color: "var(--mantine-primary-color-7)",
        },
      ]}
      type="area"
      height={"100%"}
      width={"100%"}
    />
  );
}
