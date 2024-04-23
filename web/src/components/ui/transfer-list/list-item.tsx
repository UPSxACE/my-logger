import { Checkbox, UnstyledButton } from "@mantine/core";

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
  return (
    <div className="flex select-none items-center gap-2 hover:bg-gray-100">
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
    </div>
  );
}
