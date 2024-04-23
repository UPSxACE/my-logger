"use client";
import BasicCard from "@/components/dashboard-ui/basic-card";
import TransferList, {
  TransferListElement,
} from "@/components/ui/transfer-list/transfer-list";
import useRequestNotification from "@/hooks/use-request-notification";
import { Button, Divider } from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";

interface ConfigPageState {
  firstLoad: boolean;
  machines: null | any[];
  trackedMachines: null | string[];
  sendingRequest: boolean;
  error: null | Error;
}

// { label: "Machine 3", value: "asgfas", checked: false },
export default function ConfigPage() {
  const [state, setState] = useState<ConfigPageState>({
    firstLoad: false,
    machines: null,
    trackedMachines: null,
    sendingRequest: false,
    error: null,
  });

  const loading = Boolean(
    !state.firstLoad ||
      !state.machines ||
      !state.trackedMachines ||
      state.sendingRequest ||
      state.error,
  );
  const loadingList = Boolean(!state.firstLoad || state.error);
  const [stateLeft, setStateLeft] = useState<TransferListElement[]>([]);
  const [stateRight, setStateRight] = useState<TransferListElement[]>([]);

  const { newNotification, updateToFailed, updateToSuccess } =
    useRequestNotification();

  useEffect(() => {
    // fetch all machines
    axios
      .get(process.env.NEXT_PUBLIC_API_URL + "/api/machines", {
        withCredentials: true,
      })
      .then((res) => {
        setState((state) => ({
          ...state,
          machines: res?.data,
        }));
      })
      .catch((err) => setState((state) => ({ ...state, error: err })));

    // fetch the ones already that are being tracked
    axios
      .get(process.env.NEXT_PUBLIC_API_URL + "/api/config/realtime", {
        withCredentials: true,
      })
      .then((res) => {
        setState((state) => ({
          ...state,
          trackedMachines: res?.data?.machines_to_track,
        }));
      })
      .catch((err) => setState((state) => ({ ...state, error: err })));
  }, []);

  useEffect(() => {
    const pageReady = Boolean(
      !state.error && state.machines && state.trackedMachines,
    );

    // after having all fetch, and no unexpected errors having happened, we can setup the rest of the page states
    if (!state.firstLoad && pageReady) {
      let leftElements: TransferListElement[] = [];
      let rightElements: TransferListElement[] = [];

      if (state.machines && state.trackedMachines) {
        const convertMachineObject = (machine: any): TransferListElement => {
          return {
            label: machine.name,
            value: machine.id,
            checked: false,
          };
        };

        const machines = [...state.machines];

        state.trackedMachines.forEach((machineId) => {
          const index = machines.findIndex(
            (machine) => machine.id === machineId,
          );
          if (index !== -1) {
            const removedElements = machines.splice(index, 1);
            rightElements.push(convertMachineObject(removedElements[0]));
          }
        });

        leftElements = machines.map((machine) => convertMachineObject(machine));

        setStateLeft(leftElements);
        setStateRight(rightElements);
        setState((state) => ({ ...state, firstLoad: true }));
      }
    }
  }, [state]);

  function handleSubmit() {
    setState((state) => ({ ...state, sendingRequest: true }));
    // FIXME: notifications + page lock when update + socket retry?

    const notificationId = newNotification(
      "update-realtime-tracking",
      "Updating the settings...",
      "Please hold of for a second, this will be fast.",
    );

    axios
      .post(
        process.env.NEXT_PUBLIC_API_URL +
          "/api/config/realtime/machines-tracking",
        stateRight.map((machine) => machine.value),
        {
          withCredentials: true,
        },
      )
      .then(() => {
        updateToSuccess(
          notificationId,
          "Done!",
          "If you blinked, you missed it.",
        );
      })
      .catch(() => {
        updateToFailed(
          notificationId,
          "Unexpected error",
          "Something went wrong. Please try again later.",
        );
      })
      .finally(() =>
        setState((state) => ({ ...state, sendingRequest: false })),
      );
  }

  return (
    <main className="flex flex-col gap-4">
      <BasicCard className="flex flex-col !p-0 text-gray-600">
        <div className="flex flex-col gap-3 p-6">
          <h1 className="m-0 text-2xl font-bold text-black">
            Resource tracking settings
          </h1>
          <p className="m-0 mb-1">
            Select which machines to track the resource usage in real time. The
            first one in the list will also be shown in the homepage.
          </p>
          <div className="flex justify-center">
            <TransferList
              disabled={loading}
              loading={loadingList}
              leftState={[stateLeft, setStateLeft]}
              rightState={[stateRight, setStateRight]}
              titleLeft="Not tracking"
              titleRight="Tracking"
            />
          </div>
        </div>
        <Divider color="#00000019" />
        <div className="flex items-center p-3 px-6">
          <span className="text-sm">
            Changing this setting will force every user to refresh their pages.
          </span>
          <Button
            form="add-machine"
            className="ml-auto"
            size="xs"
            loading={loading}
            onClick={handleSubmit}
          >
            Save
          </Button>
        </div>
      </BasicCard>
    </main>
  );
}
