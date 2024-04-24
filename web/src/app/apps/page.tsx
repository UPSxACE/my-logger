"use client";
import BasicCard from "@/components/dashboard-ui/basic-card";
import DashboardTable from "@/components/dashboard-ui/table";
import useRequestNotification from "@/hooks/use-request-notification";
import { Button, Divider, Select, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useQuery } from "@tanstack/react-query";
import { useReactTable } from "@tanstack/react-table";
import axios from "axios";
import { useState } from "react";
import { getAppsTableConfig } from "../_components/apps-table";

export default function AppsPage() {
  const [sendingRequest, setSendingRequest] = useState(false);

  const {
    error: machines_error,
    data: machines_data,
    isLoading: machines_isLoading,
  } = useQuery({
    queryKey: ["machines"],
    queryFn: () =>
      axios
        .get(process.env.NEXT_PUBLIC_API_URL + "/api/machines", {
          withCredentials: true,
        })
        .then((res) => res.data),
  });

  const { error, data, isLoading, refetch } = useQuery({
    queryKey: ["apps"],
    queryFn: () =>
      axios
        .get(process.env.NEXT_PUBLIC_API_URL + "/api/apps", {
          withCredentials: true,
        })
        .then((res) => res.data),
  });

  const table = useReactTable(getAppsTableConfig(data, refetch));

  const form = useForm({
    initialValues: {
      name: "",
      url: "",
      machine_id: "",
    },
    validate: {
      name: () => null,
      url: () => null,
      machine_id: () => null,
    },
  });

  const { newNotification, updateToFailed, updateToSuccess } =
    useRequestNotification();

  async function handleAddApp() {
    setSendingRequest(true);

    const notificationId = newNotification(
      "adding-app",
      "Adding the app...",
      "Please hold of for a second, this will be fast.",
    );

    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/api/apps", form.values, {
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
          <h1 className="m-0 text-2xl font-bold text-black">Add a new app</h1>
          <form
            id="add-app"
            className="flex flex-col gap-4"
            onSubmit={form.onSubmit(handleAddApp)}
          >
            <div className="flex gap-4">
              <TextInput
                required
                label="App name"
                placeholder="App name"
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
              <Select
                required
                label="Machine"
                placeholder="Machine"
                data={((machines_data as any | null) || []).map(
                  (machine: any) => {
                    return {
                      label: machine.name,
                      value: machine.id,
                    };
                  },
                )}
                className="flex-1"
                classNames={{
                  label: "mb-2 font-semibold",
                  input: "light-input",
                }}
                onChange={(machineId) =>
                  machineId && form.setFieldValue("machine_id", machineId)
                }
                error={form.errors.machine_id}
              />
            </div>
            <div className="flex gap-4">
              <TextInput
                required
                label="URL"
                placeholder="URL"
                value={form.values.url}
                onChange={(event) =>
                  form.setFieldValue("url", event.target.value)
                }
                radius="sm"
                error={form.errors.url}
                className="flex-1"
                classNames={{
                  label: "mb-2 font-semibold",
                  input: "light-input",
                }}
              />
            </div>
          </form>
        </div>
        <Divider color="#00000019" />
        <div className="flex items-center p-3 px-6">
          <span className="text-sm">
            Don&apos;t forget to add the logging code to your app&apos;s logger.
          </span>
          <Button
            type="submit"
            form="add-app"
            className="ml-auto"
            size="xs"
            loading={sendingRequest || machines_isLoading}
          >
            Add Note
          </Button>
        </div>
      </BasicCard>

      <BasicCard className="!px-0 text-gray-600">
        <DashboardTable table={table} loading={Boolean(isLoading || error)} />
      </BasicCard>
    </main>
  );
}
