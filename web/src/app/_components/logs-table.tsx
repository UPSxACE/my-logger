"use client";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table";

export interface RequestLog {
  RequestAddr: string;
  RequestMethod: string;
  RequestPath: string;
  Duration: number; //nanoseconds
}

export function getLogsTableConfig(
  data: RequestLog[],
  refetch: ReturnType<typeof useQuery>["refetch"],
) {
  return {
    columns: logsColumns,
    data: data || [],
    getCoreRowModel: getCoreRowModel<RequestLog>(),
    meta: {
      refetchData() {
        refetch();
      },
    },
  };
}

const columnHelper = createColumnHelper<RequestLog>();
const logsColumns = [
  columnHelper.accessor((log) => log.RequestAddr, {
    header: "Host".toUpperCase(),
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor((log) => log?.RequestMethod, {
    header: "Method".toUpperCase(),
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor((log) => log?.RequestPath, {
    header: "Path".toUpperCase(),
    cell: (info) => info.renderValue(),
  }),

  columnHelper.accessor(
    (log) => {
      const ms = log?.Duration / 1000000000;
      const roundedNumber = Math.round(ms * 10) / 10;
      return roundedNumber + "ms";
    },
    {
      header: "Duration".toUpperCase(),
      cell: (info) => info.renderValue(),
    },
  ),
];
