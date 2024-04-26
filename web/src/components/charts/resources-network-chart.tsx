"use client";

import { TimespanOptions } from "@/app/resources/page";
import { Loader } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { RefObject } from "react";
import ReactApexChart from "react-apexcharts";
import useObserveRefresh from "./_hooks/use-observe-refresh";

export default function ResourcesNetworkChart({
  refreshRef,
  timespan,
  dictionary,
}: {
  refreshRef: RefObject<HTMLButtonElement>;
  timespan: TimespanOptions;
  dictionary: [Record<string, string> | undefined, Error | null, boolean];
}) {
  const [dictionaryData, dictionaryErr, dictionaryLoading] = dictionary;

  function getRange() {
    switch (timespan) {
      case "30m":
        return 1800000;
      case "24h":
        return 86400000;
      case "7d":
        return 604800000;
      case "30d":
        return 2592000000;
      default:
        return undefined;
    }
  }

  const { error, data, isLoading, refetch } = useQuery({
    enabled: !dictionaryLoading && !dictionaryErr,
    queryKey: ["chart-network"],
    queryFn: () =>
      axios
        .get(process.env.NEXT_PUBLIC_API_URL + "/api/data/network", {
          withCredentials: true,
        })
        .then((res) => {
          const newData: any[] = [];
          Object.keys(res.data).forEach((key) => {
            const name = dictionaryData?.[key];
            if (name) {
              newData.push({
                name,
                data: res.data[key],
              });
            }
          });
          return newData;
        }),
    // retry: true,
    retryDelay: 1000,
    staleTime: Infinity,
  });

  useObserveRefresh(refreshRef, () => refetch());

  if (isLoading || error || dictionaryErr || dictionaryLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 py-8 opacity-100">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        <ReactApexChart
          options={{
            plotOptions: {
              bar: {
                borderRadius: 4,
                borderRadiusApplication: "end",
                horizontal: true,
                colors: {
                  backgroundBarOpacity: 1,
                },
              },
            },
            // colors: ["#3b3979", "#504c97", "#6a65b0", "#9b98ca", "#e0dff2"],
            colors: [
              "var(--mantine-primary-color-9)",
              "var(--mantine-primary-color-6)",
              "var(--mantine-primary-color-4)",
              "var(--mantine-primary-color-2)",
              "var(--mantine-primary-color-1)",
            ],
            // theme: {
            //   monochrome: {
            //     enabled: true,
            //     color: "#504c97",
            //   },
            // },
            chart: {
              id: "network-chart",
              type: "bar",
              height: "100%",

              toolbar: {
                show: false,
                // autoSelected: "zoom",
              },
            },
            dataLabels: {
              enabled: false,
            },
            markers: {
              size: 0,
            },

            xaxis: {
              // type: "datetime",
              range: getRange(),
              // labels: {
              //   formatter: function (val, timestamp) {
              //     return dayjs(timestamp || 0).format("HH:mm");
              //   },
              // },
              // categories: mockData.map((x) => x.name),
              // min: 0,
              // max: 100,
            },
            yaxis: {
              labels: {
                formatter: function (val, timestamp) {
                  return dayjs(val || 0).format("HH:mm");
                },
              },
            },
            tooltip: {
              shared: false,
              x: {
                format: "dd MMMM HH:mm",
                formatter(timestamp, opts) {
                  return dayjs(timestamp || 0).format("DD MMMM HH:mm:ss");
                },
              },
              y: {
                formatter(val, opts) {
                  return Math.round(val / 1000) + "Mb";
                },
              },
            },
          }}
          series={data?.slice(0, 5)} //FIXME
          type="bar"
          height={"100%"}
        />
      </div>
    </div>
  );
}
