"use client";
import BasicCard from "@/components/dashboard-ui/basic-card";
import DashboardTable from "@/components/dashboard-ui/table";
import useRequestNotification from "@/hooks/use-request-notification";
import { Button, Divider, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useQuery } from "@tanstack/react-query";
import { useReactTable } from "@tanstack/react-table";
import axios from "axios";
import { useState } from "react";
import { getMachinesTableConfig } from "../_components/machines-table";

export default function MachinesPage() {
  const [sendingRequest, setSendingRequest] = useState(false);

  const { error, data, isLoading, refetch } = useQuery({
    queryKey: ["machines"],
    queryFn: () =>
      axios
        .get(process.env.NEXT_PUBLIC_API_URL + "/api/machines", {
          withCredentials: true,
        })
        .then((res) => res.data),
  });

  const table = useReactTable(getMachinesTableConfig(data, refetch));

  const form = useForm({
    initialValues: {
      name: "",
      host_url: "",
    },
    validate: {
      name: () => null,
      host_url: () => null,
    },
  });

  const { newNotification, updateToFailed, updateToSuccess } =
    useRequestNotification();

  async function handleAddMachine() {
    setSendingRequest(true);

    const notificationId = newNotification(
      "adding-machine",
      "Adding the machine...",
      "Please hold of for a second, this will be fast.",
    );

    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/api/machines", form.values, {
        withCredentials: true,
      })
      .then((res) => {
        refetch();
        updateToSuccess(
          notificationId,
          "Done!",
          "If you blinked, you missed it.",
        );
      })
      .catch((err) => {
        updateToFailed(
          notificationId,
          "Unexpected error",
          "Something went wrong. Please try again later.",
        );
      })
      .finally(() => {
        setSendingRequest(false);
      });
  }

  return (
    <main className="flex flex-col gap-4">
      <BasicCard className="flex flex-col !p-0 text-gray-600">
        <div className="flex flex-col gap-3 p-6">
          <h1 className="m-0 text-2xl font-bold text-black">
            Add a new machine
          </h1>
          <form
            id="add-machine"
            className="flex gap-4"
            onSubmit={form.onSubmit(handleAddMachine)}
          >
            <TextInput
              required
              label="Machine name"
              placeholder="Machine name"
              value={form.values.name}
              onChange={(event) =>
                form.setFieldValue("name", event.target.value)
              }
              radius="sm"
              error={form.errors.name}
              className="flex-1"
              classNames={{
                label: "mb-2 font-semibold",
                input: "light-input",
              }}
            />
            <TextInput
              required
              label="Host URL"
              placeholder="Host URL"
              value={form.values.host_url}
              onChange={(event) =>
                form.setFieldValue("host_url", event.target.value)
              }
              radius="sm"
              error={form.errors.host_url}
              className="flex-1"
              classNames={{
                label: "mb-2 font-semibold",
                input: "light-input",
              }}
            />
          </form>
        </div>
        <Divider color="#00000019" />
        <div className="flex items-center p-3 px-6">
          <span className="text-sm">
            Don&apos;t forget to add the monitoring script to your machine.
          </span>
          <Button
            type="submit"
            form="add-machine"
            className="ml-auto"
            size="xs"
            loading={sendingRequest}
          >
            Add Machine
          </Button>
        </div>
      </BasicCard>

      <BasicCard className="!px-0 text-gray-600">
        <DashboardTable table={table} loading={Boolean(isLoading || error)} />
      </BasicCard>
    </main>
  );
}
