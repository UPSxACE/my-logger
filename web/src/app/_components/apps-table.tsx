"use client";
import useRequestNotification from "@/hooks/use-request-notification";
import { Button } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table";
import axios from "axios";
import { useState } from "react";
import { LuTrash2 } from "react-icons/lu";

export interface App {
  id: string;
  name: string;
  api_key: { value: string }[];
  url: string;
  machine: any; // TODO: give a proper type to this
}

export function getAppsTableConfig(
  data: App[],
  refetch: ReturnType<typeof useQuery>["refetch"],
) {
  return {
    columns: appsColumns,
    data: data || [],
    getCoreRowModel: getCoreRowModel<App>(),
    meta: {
      refetchData() {
        refetch();
      },
    },
  };
}

const columnHelper = createColumnHelper<App>();
const appsColumns = [
  columnHelper.accessor((app) => app.name, {
    header: "Name".toUpperCase(),
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor((app) => app?.machine?.[0]?.name, {
    header: "Machine".toUpperCase(),
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor((app) => app.url, {
    header: "URL".toUpperCase(),
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor((app) => app.id, {
    header: "Actions".toUpperCase(),
    cell: function ActionsCell(info) {
      const [sendingRequest, setSendingRequest] = useState(false);

      const { newNotification, updateToFailed, updateToSuccess } =
        useRequestNotification();

      function handleDelete() {
        setSendingRequest(true);
        const notifId = newNotification(
          "delete-app",
          "Deleting app...",
          "Please hold of for a second, this will be fast.",
        );

        axios
          .delete(
            process.env.NEXT_PUBLIC_API_URL + "/api/apps/" + info.getValue(),
            {
              withCredentials: true,
            },
          )
          .then((res) => {
            updateToSuccess(notifId, "Done!", "If you blinked, you missed it.");
            const refetch = (info.table.options?.meta as any | null)
              ?.refetchData;
            refetch();
          })
          .catch((err) => {
            updateToFailed(
              notifId,
              "Unexpected error",
              "Something went wrong. Please try again later.",
            );
          })
          .finally(() => setSendingRequest(false));
      }

      return (
        <Button
          variant="subtle"
          className="ml-2 h-[2rem] w-[2rem] !transform-none p-0 text-xl !text-red-500"
          loaderProps={{
            color: "rgb(239 68 68)",
          }}
          loading={sendingRequest}
          onClick={handleDelete}
        >
          <LuTrash2 />
        </Button>
      );
    },
  }),
];
