"use client";
import BasicCard from "@/components/dashboard-ui/basic-card";
import ChartCard from "@/components/dashboard-ui/chart-card";
import { Button, Select } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { MdRefresh } from "react-icons/md";

const ResourcesCpuChart = dynamic(
  () => import("@/components/charts/resources-cpu-chart"),
  {
    ssr: false,
  },
);

const ResourcesRamChart = dynamic(
  () => import("@/components/charts/resources-ram-chart"),
  {
    ssr: false,
  },
);

const ResourcesDiskChart = dynamic(
  () => import("@/components/charts/resources-disk-chart"),
  {
    ssr: false,
  },
);

const ResourcesNetworkChart = dynamic(
  () => import("@/components/charts/resources-network-chart"),
  {
    ssr: false,
  },
);

//FIXME last 24 hours / last 3 days / last 7 days / last 1 month / last 1 year

export type TimespanOptions = "30m" | "24h" | "7d" | "30d" | "ever";

export default function Resources() {
  const [timespan, setTimespan] = useState<TimespanOptions>("30m");
  const refreshRef = useRef<HTMLButtonElement>(null);

  const { error, data, isLoading } = useQuery({
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

  return (
    <main className="flex flex-1 flex-col gap-4">
      <div className="flex items-stretch">
        <BasicCard className="p-0">
          <Select
            allowDeselect={false}
            classNames={{ input: "pl-3" }}
            comboboxProps={{
              offset: 0,
              position: "top-start",
            }}
            value={timespan}
            onChange={(value) => value && setTimespan(value as TimespanOptions)}
            variant="unstyled"
            data={[
              { label: "Last 30 minutes", value: "30m" },
              { label: "Last 24h", value: "24h" },
              { label: "Last 7 days", value: "7d" },
              { label: "Last 30 days", value: "30d" },
              { label: "Ever", value: "ever" },
            ]}
          />
        </BasicCard>
        <Button
          style={{
            boxShadow:
              "rgba(27, 31, 35, 0.04) 0px 1px 0px, rgba(255, 255, 255, 0.25) 0px 1px 0px inset",
          }}
          variant="white"
          className="ml-auto text-gray-800 hover:text-mantine-primary-7"
          leftSection={<MdRefresh className="text-lg" />}
          ref={refreshRef}
        >
          Refresh
        </Button>
      </div>
      <div className="grid flex-1 grid-cols-[auto_auto_auto] grid-rows-[auto_auto] gap-4">
        <ChartCard height={"30rem"} title="Cpu Usage" className="col-span-2">
          <ResourcesCpuChart
            dictionary={[data, error, isLoading]}
            timespan={timespan}
            refreshRef={refreshRef}
          />
        </ChartCard>
        <ChartCard title="Disk Usage">
          <ResourcesDiskChart
            dictionary={[data, error, isLoading]}
            timespan={timespan}
            refreshRef={refreshRef}
          />
        </ChartCard>
        <ChartCard height={"30rem"} title="Ram Usage" className="col-span-2">
          <ResourcesRamChart
            dictionary={[data, error, isLoading]}
            timespan={timespan}
            refreshRef={refreshRef}
          />
        </ChartCard>
        <ChartCard title="Network Usage">
          {" "}
          <ResourcesNetworkChart
            dictionary={[data, error, isLoading]}
            timespan={timespan}
            refreshRef={refreshRef}
          />
        </ChartCard>
      </div>
    </main>
  );
}
