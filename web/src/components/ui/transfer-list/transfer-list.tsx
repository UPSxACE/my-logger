"use client";
import { Button, Checkbox, Loader } from "@mantine/core";
import { Reorder } from "framer-motion";
import { Dispatch, SetStateAction, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import DraggableListItem from "./draggable-list-item";
import ListItem from "./list-item";

export interface TransferListElement {
  label: string;
  value: string;
  checked: boolean;
}

type ElementState = [
  TransferListElement[],
  Dispatch<SetStateAction<TransferListElement[]>>,
];

export default function TransferList({
  leftState,
  rightState,
  titleLeft,
  titleRight,
  loading,
  disabled,
}: {
  leftState: ElementState;
  rightState: ElementState;
  titleLeft: string;
  titleRight: string;
  loading?: boolean;
  disabled?: boolean;
}) {
  const [allLeft, setAllLeft] = useState(false);
  const [allRight, setAllRight] = useState(false);

  const [stateLeft, setStateLeft] = leftState;
  const [stateRight, setStateRight] = rightState;

  function handleTriggerAllLeft() {
    let newVal = !allLeft;
    setAllLeft(newVal);
    setStateLeft((state) => state.map((x) => ({ ...x, checked: newVal })));
  }

  function handleTriggerAllRight() {
    let newVal = !allRight;
    setAllRight(newVal);
    setStateRight((state) => state.map((x) => ({ ...x, checked: newVal })));
  }

  function handleClickLeftItem(value: string) {
    setAllLeft(false);
    setStateLeft((state) => {
      return state.map((x) =>
        x.value === value ? { ...x, checked: !x.checked } : x,
      );
    });
  }

  function handleClickRightItem(value: string) {
    setAllRight(false);
    setStateRight((state) => {
      return state.map((x) =>
        x.value === value ? { ...x, checked: !x.checked } : x,
      );
    });
  }

  function handleClickArrowLeft() {
    setAllLeft(false);
    setAllRight(false);

    let movedItems: TransferListElement[] = [];
    let filteredRight = stateRight.filter((x) => {
      if (x.checked) {
        movedItems.push({ ...x, checked: false });
        return false;
      }
      return true;
    });

    setStateRight(filteredRight);
    setStateLeft((state) => [...state, ...movedItems]);
  }

  function handleClickArrowRight() {
    setAllLeft(false);
    setAllRight(false);

    let movedItems: TransferListElement[] = [];
    let filteredLeft = stateLeft.filter((x) => {
      if (x.checked) {
        movedItems.push({ ...x, checked: false });
        return false;
      }
      return true;
    });

    setStateLeft(filteredLeft);
    setStateRight((state) => [...state, ...movedItems]);
  }

  if (loading) {
    return (
      <div className="flex w-full min-w-[400px] max-w-[720px] items-center justify-center text-mantine-text max-xs:min-w-0 ">
        <Loader />
      </div>
    );
  }

  return (
    <div className="grid w-full min-w-[400px] max-w-[720px] grid-cols-9 grid-rows-[auto_auto] text-mantine-text max-xs:min-w-0 max-xs:grid-cols-4">
      <div className="col-span-4 flex items-center gap-2 rounded-tl-md rounded-tr-md border border-solid border-[#00000030] px-4 py-3 max-xs:order-1 max-xs:border-b-0">
        <Checkbox checked={allLeft} onChange={() => handleTriggerAllLeft()} />
        <span className="m-0 text-base font-medium">{titleLeft}</span>
      </div>
      <div className="row-span-2 flex flex-col items-center justify-center gap-3 border px-4 py-3 max-xs:order-3 max-xs:col-span-4 max-xs:flex-row">
        <Button
          className="max-xs-rotate90 h-9 w-9 p-0"
          onClick={handleClickArrowRight}
          disabled={disabled}
        >
          <FaChevronRight />
        </Button>
        <Button
          variant="outline"
          className="max-xs-rotate90 h-9 w-9 p-0"
          onClick={handleClickArrowLeft}
          disabled={disabled}
        >
          <FaChevronLeft />
        </Button>
      </div>
      <div className="col-span-4 flex items-center gap-2 rounded-tl-md rounded-tr-md border border-solid border-[#00000030] px-4 py-3 max-xs:order-4 max-xs:border-b-0">
        <Checkbox checked={allRight} onChange={() => handleTriggerAllRight()} />
        <span className="m-0 text-base font-medium">{titleRight}</span>
      </div>
      <div className="col-span-4 min-h-[100px] rounded-bl-md rounded-br-md border border-solid border-[#00000030] max-xs:order-2 xs:border-t-0">
        <div className="flex flex-col">
          {stateLeft.map((item) => (
            <ListItem
              key={item.value}
              item={item}
              onClick={handleClickLeftItem}
              checked={item.checked}
            />
          ))}
        </div>
      </div>
      <div className="col-span-4 min-h-[100px] rounded-bl-md rounded-br-md border border-solid border-[#00000030] max-xs:order-5 xs:border-t-0">
        <Reorder.Group
          values={stateRight}
          onReorder={setStateRight}
          className="m-0 overflow-hidden p-0"
        >
          {stateRight.map((item) => (
            <DraggableListItem
              key={item.value}
              item={item}
              onClick={handleClickRightItem}
              checked={item.checked}
            />
          ))}
        </Reorder.Group>
      </div>
    </div>
  );
}
