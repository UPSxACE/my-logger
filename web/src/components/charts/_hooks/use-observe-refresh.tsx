import { RefObject, useEffect } from "react";

export default function useObserveRefresh(
  refreshRef: RefObject<HTMLButtonElement>,
  onRefresh: EventListener,
) {
  useEffect(() => {
    let node: HTMLButtonElement;

    if (refreshRef.current) {
      node = refreshRef.current;

      node.addEventListener("click", onRefresh);
    }

    return () => {
      node?.removeEventListener("click", onRefresh);
    };
  }, [refreshRef, onRefresh]);
}
