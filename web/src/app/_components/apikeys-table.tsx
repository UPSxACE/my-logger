"use client";
import { Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table";
import { LuCheck, LuClipboard, LuEye, LuEyeOff } from "react-icons/lu";

export interface ApiKey {
  id: string;
  name: string;
  value: string;
  machine: any; // TODO: give a proper type to this
}

export function getApiKeysTableConfig(
  data: ApiKey[],
  refetch: ReturnType<typeof useQuery>["refetch"],
) {
  return {
    columns: apikeysColumns,
    data: data || [],
    getCoreRowModel: getCoreRowModel<ApiKey>(),
    meta: {
      refetchData() {
        refetch();
      },
    },
  };
}

const columnHelper = createColumnHelper<ApiKey>();
const apikeysColumns = [
  columnHelper.accessor((apikey) => apikey.name, {
    header: "Name".toUpperCase(),
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor((apikey) => apikey?.machine?.[0]?.name, {
    header: "Machine".toUpperCase(),
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor((apikey) => apikey.value, {
    header: "Value".toUpperCase(),
    cell: function Cell(info) {
      const value = info.getValue();

      const [valueShowing, { toggle: toggleValueShowing, open: showValue }] =
        useDisclosure(false);
      const [checkShowing, { close: hideCheck, open: showCheck }] =
        useDisclosure(false);

      return (
        <div className="flex items-center">
          <span>{valueShowing ? value : "∗".repeat(32)}</span>
          <Button
            variant="subtle"
            className="ml-2 h-[2rem] w-[2rem] !transform-none p-0 text-xl !text-gray-700"
            onClick={() => {
              toggleValueShowing();
            }}
          >
            {valueShowing ? <LuEyeOff /> : <LuEye />}
          </Button>
          <Button
            variant="subtle"
            className="h-[2rem] w-[2rem] !transform-none p-0 text-lg !text-gray-700"
            onClick={() => {
              showCheck();
              setTimeout(() => hideCheck(), 2000);
              navigator.clipboard.writeText(value);
            }}
            // styles={{ root: { ":active": { transform: "none" } } }}
          >
            {checkShowing ? (
              <LuCheck className="text-mantine-green-9" />
            ) : (
              <LuClipboard />
            )}
          </Button>
        </div>
      );
    },
  }),
];
