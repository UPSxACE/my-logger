"use client";

import { TimespanOptions } from "@/app/resources/page";
import { Loader } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { RefObject } from "react";
import ReactApexChart from "react-apexcharts";
import useObserveRefresh from "./_hooks/use-observe-refresh";

// const mockData = [
//   {
//     name: "XYZ MOTORS",
//     data: [
//       {
//         x: "2024-04-23T17:08:49+01:00",
//         y: 49,
//       },
//       {
//         x: "2024-04-23T17:13:49+01:00",
//         y: 49,
//       },
//       {
//         x: "2024-04-23T17:16:49+01:00",
//         y: 49,
//       },
//       {
//         x: "2024-04-23T17:21:49+01:00",
//         y: 49,
//       },
//       {
//         x: "2024-04-23T17:26:49+01:00",
//         y: 49,
//       },
//       {
//         x: "2024-04-23T17:31:49+01:00",
//         y: 49,
//       },
//       {
//         x: "2024-04-23T17:36:49+01:00",
//         y: 49,
//       },
//       {
//         x: "2024-04-23T17:41:49+01:00",
//         y: 49,
//       },
//       {
//         x: "2024-04-23T17:46:49+01:00",
//         y: 49,
//       },
//       {
//         x: "2024-04-23T17:51:49+01:00",
//         y: 75,
//       },
//       {
//         x: "2024-04-23T17:56:49+01:00",
//         y: 56,
//       },
//       {
//         x: "2024-04-23T18:01:49+01:00",
//         y: 61,
//       },
//       {
//         x: "2024-04-23T18:06:49+01:00",
//         y: 61,
//       },
//       {
//         x: "2024-04-23T18:56:49+01:00",
//         y: 61,
//       },
//       {
//         x: "2024-04-23T19:46:49+01:00",
//         y: 61,
//       },
//       {
//         x: "2024-04-23T19:46:49+01:00",
//         y: 61,
//       },
//       {
//         x: "2024-04-23T20:36:49+01:00",
//         y: 90,
//       },
//       {
//         x: "2024-04-23T21:26:49+01:00",
//         y: 90,
//       },
//       {
//         x: "2024-04-23T22:16:49+01:00",
//         y: 90,
//       },
//       {
//         x: "2024-04-23T23:06:49+01:00",
//         y: 90,
//       },
//       {
//         x: "2024-04-23T23:56:49+01:00",
//         y: 90,
//       },
//       {
//         x: "2024-04-24T00:46:49+01:00",
//         y: 90,
//       },
//       {
//         x: "2024-04-24T01:36:49+01:00",
//         y: 90,
//       },
//       {
//         x: "2024-04-24T02:26:49+01:00",
//         y: 34,
//       },
//       {
//         x: "2024-04-24T03:16:49+01:00",
//         y: 34,
//       },
//     ],
//   },
// ];

export default function ResourcesDiskChart({
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
    queryKey: ["chart-disk"],
    queryFn: () =>
      axios
        .get(process.env.NEXT_PUBLIC_API_URL + "/api/data/disk", {
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
              },
            },
            theme: {
              monochrome: {
                enabled: true,
                color: "#504c97",
              },
            },
            chart: {
              id: "disk-chart",
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
                  return val + "%";
                },
              },
            },
          }}
          series={data}
          type="bar"
          height={"100%"}
        />
      </div>
    </div>
  );
}
