import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { DoneTracker } from "./done-tracker-interface";
import { LeafDoneTracker } from "./leaf-done-tracker";
import { NodeDoneTracker } from "./node-done-tracker";
import { useDoneTrackerRaw } from "./use-done-tracker-raw";

export const useLeafDoneTracker = (
  doneTracker: NodeDoneTracker,
  {
    name,
    done,
    error,
    reset
  }: {
    name?: string;
    done?: boolean;
    error?: any;
    reset?: () => void;
  } = {}
) => {
  const localDoneTracker = useDoneTrackerRaw(doneTracker, "leaf", name);

  const check = useCallback(
    (localDoneTracker: LeafDoneTracker) => {
      if (done) localDoneTracker.signalDone();
      if (error) localDoneTracker.signalError(error);
    },
    [done, error]
  );

  const prevDoneTracker = useRef<DoneTracker>();

  useMemo(() => {
    if (prevDoneTracker.current !== localDoneTracker) reset?.();
    prevDoneTracker.current = localDoneTracker;
    // reset when there's a new done tracker
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localDoneTracker, reset]);

  // useLayoutEffect is used so the doneness can be detected before first paint
  useLayoutEffect(() => check(localDoneTracker), [check, localDoneTracker]);
  // useEffect is used because the leaf might not be added to the parent yet
  useEffect(() => check(localDoneTracker), [check, localDoneTracker]);

  return [
    localDoneTracker,
    {
      check: useCallback(
        () => check(localDoneTracker),
        [check, localDoneTracker]
      ),
    },
  ] as const;
};
