"use client";
import BasicCard from "@/components/dashboard-ui/basic-card";
import DashboardTable from "@/components/dashboard-ui/table";
import { Button } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useReactTable } from "@tanstack/react-table";
import axios from "axios";
import { useState } from "react";
import { VscChevronLeft, VscChevronRight } from "react-icons/vsc";
import { RequestLog, getLogsTableConfig } from "../_components/logs-table";

export default function Logs() {
  const [page, setPage] = useState(1);

  const { error, data, isLoading, refetch } = useQuery({
    queryKey: ["request-logs"],
    queryFn: () =>
      axios
        .get(process.env.NEXT_PUBLIC_API_URL + "/api/log/app", {
          withCredentials: true,
        })
        .then((res) => res.data),
    // retry: false,
    staleTime: Infinity,
  });

  //FIXME make this configurable + filterable
  const filteredData = data?.length
    ? data.filter((x: RequestLog) => x.RequestPath !== "/api/ws")
    : [];

  const nPages = filteredData?.length
    ? Math.floor(filteredData?.length / 14) + 1
    : 1;
  const sliceStart = 14 * (page - 1);
  const sliceEnd = 14 + sliceStart;
  // const hasNextPage = filteredData?.length ? sliceEnd < filteredData?.length : false;

  const slicedData = filteredData?.length
    ? filteredData.slice(sliceStart, sliceEnd)
    : [];
  const table = useReactTable(getLogsTableConfig(slicedData, refetch));

  return (
    <main className="flex flex-col gap-[0.35rem]">
      <BasicCard className="!px-0 text-gray-600">
        <DashboardTable table={table} loading={Boolean(isLoading || error)} />
      </BasicCard>
      <BasicCard className="ml-auto mr-auto flex w-fit items-center justify-center gap-3 bg-transparent p-2 !px-2 text-lg font-medium text-gray-600 !shadow-none">
        <Button
          variant="default"
          className="aspect-square p-0 text-lg"
          onClick={() => {
            setPage((cPage) => Math.max(1, cPage - 1));
          }}
        >
          <VscChevronLeft />
        </Button>
        {page} / {nPages}{" "}
        <Button
          variant="default"
          className="aspect-square p-0 text-lg"
          onClick={() => {
            setPage((cPage) => Math.min(nPages, cPage + 1));
          }}
        >
          <VscChevronRight />
        </Button>
      </BasicCard>
    </main>
  );
}
