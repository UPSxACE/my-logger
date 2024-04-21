import { Loader } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

let _id = 0;

export default function useRequestNotification() {
  function newNotification(id: string, title: string, message: string): string {
    const notificationId = id + "-" + ++_id;

    notifications.show({
      id: notificationId,
      title,
      message,
      icon: <Loader color="blue.9" size={30} />,
      withCloseButton: false,
      autoClose: false,
    });

    return notificationId;
  }

  function updateToSuccess(id: string, title: string, message: string) {
    notifications.update({
      id: id,
      title: title,
      message: message,
      icon: <FaCheckCircle size={30} color="green" />,
      classNames: {
        root: "max-sm:hidden",
        icon: "bg-white mt-1 mr-3",
      },
      autoClose: 5000,
    });
  }

  function updateToFailed(id: string, title: string, message: string) {
    notifications.update({
      id: id,
      title: title,
      message: message,
      icon: <FaTimesCircle size={30} color="red" />,
      classNames: {
        icon: "bg-white mt-1 mr-3",
      },
      autoClose: 7500,
    });
  }

  return { newNotification, updateToSuccess, updateToFailed };
}
