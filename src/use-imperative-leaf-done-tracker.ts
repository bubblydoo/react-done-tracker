import { useEffect } from "react";
import { DoneTrackerError } from "./done-tracker-error";
import { NodeDoneTracker } from "./node-done-tracker";
import { useDoneTrackerRaw } from "./use-done-tracker-raw";

export const useImperativeLeafDoneTracker = (
  doneTracker: NodeDoneTracker,
  {
    name,
    done,
    error,
  }: {
    name?: string;
    done?: boolean;
    error?: any;
  } = {}
) => {
  if (!doneTracker)
    throw new DoneTrackerError(
      "Falsy doneTracker passed to useImperativeLeafDoneTracker"
    );

  const localDoneTracker = useDoneTrackerRaw(doneTracker, "leaf", name);

  // we cannot use useLayoutEffect here because it might run in the same microtask as the render,
  // which would fail the ImmediatelyDoneWithChildren test

  // useEffect is used because the leaf might not be added to the parent yet
  useEffect(() => {
    if (done) {
      localDoneTracker.signalDone();
    } else if (error) {
      localDoneTracker.signalError(error);
    } else if (localDoneTracker.done || localDoneTracker.errored) {
      localDoneTracker.reset();
    }
  }, [done, error, localDoneTracker]);

  return localDoneTracker;
};
