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
import { getApiKeysTableConfig } from "../_components/apikeys-table";

export default function ApiKeyPage() {
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
    queryKey: ["api-keys"],
    queryFn: () =>
      axios
        .get(process.env.NEXT_PUBLIC_API_URL + "/api/api-keys", {
          withCredentials: true,
        })
        .then((res) => res.data),
  });

  const table = useReactTable(getApiKeysTableConfig(data, refetch));

  const form = useForm({
    initialValues: {
      name: "",
      machine_id: "",
    },
    validate: {
      name: () => null,
      machine_id: (val) => (val.length === 0 ? "This field is required" : null),
    },
  });

  const { newNotification, updateToFailed, updateToSuccess } =
    useRequestNotification();

  async function handleCreateApiKey() {
    setSendingRequest(true);

    const notificationId = newNotification(
      "adding-apikey",
      "Creating the api key...",
      "Please hold of for a second, this will be fast.",
    );

    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/api/api-keys", form.values, {
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
            Create an Api Key
          </h1>
          <form
            id="add-api-key"
            className="flex flex-col gap-4"
            onSubmit={form.onSubmit(handleCreateApiKey)}
          >
            <div className="flex gap-4">
              <TextInput
                required
                label="Name"
                placeholder="Name"
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
          </form>
        </div>
        <Divider color="#00000019" />
        <div className="flex items-center p-3 px-6">
          <span className="text-sm">
            Don&apos;t forget to place the api key in your machine&apos;s
            script(or your app&apos;s environment variables).
          </span>
          <Button
            type="submit"
            form="add-api-key"
            className="ml-auto"
            size="xs"
            loading={sendingRequest || machines_isLoading}
          >
            Create
          </Button>
        </div>
      </BasicCard>

      <BasicCard className="!px-0 text-gray-600">
        <DashboardTable table={table} loading={Boolean(isLoading || error)} />
      </BasicCard>
    </main>
  );
}
