import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { DoneTrackerError } from "./done-tracker-error";
import { DoneTracker } from "./done-tracker-interface";
import { LeafDoneTracker } from "./leaf-done-tracker";
import { NodeDoneTracker } from "./node-done-tracker";
import { useDoneTrackerRaw } from "./use-done-tracker-raw";

export const useImperativeLeafDoneTracker = (
  doneTracker: NodeDoneTracker,
  {
    name,
    done,
    error,
    reset,
  }: {
    name?: string;
    done?: boolean;
    error?: any;
    reset?: () => void;
  } = {}
) => {
  if (!doneTracker)
    throw new DoneTrackerError(
      "Falsy doneTracker passed to useImperativeLeafDoneTracker"
    );

  const localDoneTracker = useDoneTrackerRaw(doneTracker, "leaf", name);

  const prevDoneTracker = useRef<DoneTracker>();

  useMemo(() => {
    if (prevDoneTracker.current !== localDoneTracker) reset?.();
    prevDoneTracker.current = localDoneTracker;
    // reset when there's a new done tracker
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localDoneTracker, reset]);

  // we cannot use useLayoutEffect here because it might run in the same microtask as the render,
  // which would fail the ImmediatelyDoneWithChildren test

  // useEffect is used because the leaf might not be added to the parent yet
  useEffect(() => {
    if (done) localDoneTracker.signalDone();
    if (error) localDoneTracker.signalError(error);
  }, [done, error, localDoneTracker]);

  return localDoneTracker;
};
