import { useEffect } from "react";
import { NodeDoneTracker } from "./node-done-tracker";
import { useDoneTrackerRaw } from "./use-done-tracker-raw";

export const useNodeDoneTracker = (
  doneTracker: NodeDoneTracker,
  {
    name,
    willHaveChildren,
  }: {
    name?: string;
    /** If the children are not registered within one `useEffect`, turn on this flag */
    willHaveChildren?: boolean;
  } = {}
) => {
  const localDoneTracker = useDoneTrackerRaw(doneTracker, "node", name);

  // temporarily require children to prevent aborts from setting the node to done
  localDoneTracker.setWillHaveChildren(true);

  useEffect(() => {
    // if the children are delayed, use willHaveChildren
    if (willHaveChildren) return;
    queueMicrotask(() => {
      // if at this point the node doesn't have children, it will be done
      localDoneTracker.setWillHaveChildren(false);
      localDoneTracker.calculateDoneness();
    });
  }, [localDoneTracker, willHaveChildren]);

  return localDoneTracker;
};
