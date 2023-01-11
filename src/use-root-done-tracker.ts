import { useMemo } from "react";
import { NodeDoneTracker } from "./node-done-tracker";
import { useTemporarilySkipNodeDoneTracker } from "./use-temporarily-skip-node-done-tracker";

export const useRootDoneTracker = (name = "Root", deps: any[] = []) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const doneTracker = useMemo(() => new NodeDoneTracker(name), [name, ...deps]);

  useTemporarilySkipNodeDoneTracker(doneTracker, false);

  // uncomment when we want to
  // calculate doneness excessively
  // doneTracker.calculateDoneness();

  return doneTracker;
};
