import { Checkbox, UnstyledButton } from "@mantine/core";
import { Reorder, useDragControls } from "framer-motion";
import { RxDragHandleDots2 } from "react-icons/rx";

export type clickCallback = (value: string) => void;

export default function DraggableListItem({
  item,
  onClick,
  checked,
}: {
  item: { value: any; label: string };
  onClick: clickCallback;
  checked: boolean;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className="flex select-none items-center gap-2 pr-5 hover:bg-gray-100"
    >
      <Checkbox
        className="mx-4 my-3 mr-0"
        checked={checked}
        onChange={() => onClick(item.value)}
      />
      <UnstyledButton
        onClick={() => onClick(item.value)}
        className="m-0 flex-1 px-4 py-3 pl-0"
      >
        {item.label}
      </UnstyledButton>
      <div
        className="reorder-handle -m-2 ml-auto flex items-center justify-center rounded-md p-2 text-xl hover:cursor-grab hover:bg-gray-200"
        onPointerDown={(e) => controls.start(e)}
      >
        <RxDragHandleDots2 />
      </div>
    </Reorder.Item>
  );
}
