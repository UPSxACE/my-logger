import { Modal } from "@mantine/core";
import { useEffect, useState } from "react";
import { BsExclamationCircleFill } from "react-icons/bs";

export default function ConfigChanged({ opened }: { opened: boolean }) {
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;
    let interval: NodeJS.Timeout | undefined;

    if (opened) {
      timeout = setTimeout(() => {
        window.location.reload();
      }, 6000);

      interval = setInterval(() => {
        setSecondsLeft((seconds) => Math.max(0, seconds - 1));
      }, 1000);
    }

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [opened]);

  return (
    <Modal
      onClose={() => {}}
      opened={opened}
      withCloseButton={false}
      centered
      size="lg"
      classNames={{
        title: "font-semibold",
      }}
    >
      <div className="mx-4 my-8 flex flex-col items-center justify-center gap-3">
        <BsExclamationCircleFill size={120} className="text-mantine-cyan-6" />
        <h1 className="m-0 text-center text-2xl font-medium text-black">
          Your page will be refreshed
        </h1>
        <p className="m-0 text-center text-base text-gray-600">
          The app settings have been updated. Your page will be automatically
          refreshed in {secondsLeft} seconds.
        </p>
      </div>
    </Modal>
  );
}
