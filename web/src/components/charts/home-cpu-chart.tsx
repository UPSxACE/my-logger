"use client";
import { SocketContext } from "@/contexts/socket-provider/socket-provider";
import { SocketData } from "@/socket";
import { Loader, Select } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import ApexCharts from "apexcharts";
import axios from "axios";
import dayjs from "dayjs";
import { useContext, useEffect, useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { BsExclamationCircleFill } from "react-icons/bs";
import {
  DynamicRightCornerContext,
  DynamicTitleContext,
} from "../dashboard-ui/dynamic-chart-card";

export default function HomeCpuChart() {
  const [selectedMachine, setSelectedMachine] = useState<null | string>(null);
  const [dynamicTitle, setDynamicTitle] = useContext(DynamicTitleContext);
  const [_, setRightCornerElement] = useContext(DynamicRightCornerContext);

  const { socket, connected, error } = useContext(SocketContext);

  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = useRef<any>();
  const previousTimeRef = useRef<any>();
  const data = useRef<null | Record<string, any>>(null);
  const hasUpdates = useRef<boolean>(false);
  const [firstLoad, setFirstLoad] = useState(true);

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
    const updateChartFull = (messageData: SocketData) => {
      if (!dictionary_data) {
        return;
      }

      if (messageData.default === "") {
        setSelectedMachine("");
        return;
      }

      const selected = selectedMachine || messageData.default;
      data.current = messageData.data;
      hasUpdates.current = true;

      setSelectedMachine(selected);
      setDynamicTitle(dictionary_data[selected] + " Cpu Usage");
      setRightCornerElement(function SelectMachine() {
        return (
          <Select
            allowDeselect={false}
            value={selectedMachine}
            onChange={(value) => {
              setFirstLoad(true);
              setSelectedMachine(value);
            }}
            data={Object.keys(data.current || {}).map((key) => ({
              label: dictionary_data[key],
              value: key,
            }))}
          />
        );
      });
    };

    const updateChartPartial = (messageData: SocketData) => {
      if (selectedMachine === null) {
        return;
      }

      if (data.current === null) {
        data.current = {};
      }
      if (data.current?.[selectedMachine] === null) {
        data.current[selectedMachine] = { cpu: [], ram: [] };
      }

      data.current[selectedMachine].cpu = [
        ...data.current[selectedMachine].cpu,
        messageData.new_data.cpu,
      ];
      hasUpdates.current = true;
    };

    if (connected && socket && dictionary_data) {
      const animate: FrameRequestCallback = (time) => {
        if (previousTimeRef.current != undefined) {
          const deltaTime = time - previousTimeRef.current;

          if (deltaTime >= 1000) {
            if (hasUpdates.current && data.current !== null) {
              hasUpdates.current = false;

              // ApexCharts.exec(
              //   "realtime",
              //   "updateOptions",
              //   [
              //     {
              //       xaxis: {
              //         type: "datetime",
              //         range: 30000000,
              //         labels: {},
              //       },
              //     },
              //   ],
              //   firstLoad ? false : true,
              // );

              ApexCharts.exec(
                "realtime",
                "updateSeries",
                [
                  {
                    data: data.current?.[selectedMachine || ""]?.cpu || [],
                  },
                ],
                firstLoad ? false : true,
              );

              if (firstLoad) setFirstLoad(false);
            }

            previousTimeRef.current = time;
          }
        } else {
          previousTimeRef.current = time;
        }

        requestRef.current = requestAnimationFrame(animate);
      };

      socket.emit("realtime:recentusage:startlistening", null);
      socket.on("realtime:recentusage:fullupdate", updateChartFull);
      socket.on("realtime:recentusage:partialupdate", updateChartPartial);

      requestRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (connected && socket) {
        socket.emit("realtime:recentusage:stoplistening", null);
      }
      socket?.off("realtime:recentusage:fullupdate", updateChartFull);
      socket?.off("realtime:recentusage:partialupdate", updateChartPartial);
      cancelAnimationFrame(requestRef.current);
    };
  }, [
    socket,
    connected,
    dictionary_data,
    selectedMachine,
    setDynamicTitle,
    firstLoad,
    setRightCornerElement,
    error,
  ]);

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
    markers: {
      size: 0,
    },
    tooltip: {
      x: {
        format: "dd MMMM HH:mm",
        formatter(timestamp, opts) {
          return dayjs(timestamp || 0).format("DD MMMM HH:mm");
        },
      },
      y: {
        formatter(val, opts) {
          return val + "%";
        },
      },
    },
    xaxis: {
      type: "datetime",
      range: 5000000, // 5 seconds * 100 //30000000, // 5 minutes * 100
      // stepSize: 3000,
      // tickAmount: 100,
      tickAmount: 25,
      labels: {
        formatter: function (val, timestamp) {
          return dayjs(timestamp || 0).format("HH:mm");
        },
      },
    },
    yaxis: {
      min: 0,
      max: 100,
    },
    legend: {
      show: false,
    },
  };

  // data empty ....
  if (selectedMachine === "") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 py-8">
        <BsExclamationCircleFill size={120} className="text-mantine-cyan-6" />
        <h1 className="m-0 text-center text-2xl font-medium text-black">
          No machines to track
        </h1>
        <p className="m-0 text-center text-base text-gray-600">
          Please configure the machines to be tracked in real time in the app
          settings page.
        </p>
      </div>
    );
  }

  const notReady =
    !connected ||
    !dynamicTitle ||
    error ||
    dictionary_isLoading ||
    dictionary_error;

  return (
    <>
      {(notReady || firstLoad) && (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-4 py-8 opacity-100">
          <Loader />
        </div>
      )}
      <ReactApexChart
        // className="h-full"
        options={options}
        series={[
          {
            name: "Cpu Usage",
            data: [],
            color: "var(--mantine-primary-color-7)",
          },
        ]}
        type="area"
        height={"100%"}
        width={"100%"}
      />
    </>
  );
}
