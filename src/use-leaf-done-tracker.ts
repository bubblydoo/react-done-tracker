import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { DoneTracker } from "./done-tracker-interface";
import { LeafDoneTracker } from "./leaf-done-tracker";
import { NodeDoneTracker } from "./node-done-tracker";
import { useDoneTrackerRaw } from "./use-done-tracker-raw";

export const useLeafDoneTracker = (
  doneTracker: NodeDoneTracker,
  {
    name,
    isDone,
    resetDone
  }: {
    name?: string;
    isDone?: () => boolean;
    resetDone?: () => void;
  } = {}
) => {
  const localDoneTracker = useDoneTrackerRaw(doneTracker, "leaf", name);

  const check = useCallback(
    (localDoneTracker: LeafDoneTracker) => {
      if (isDone?.()) localDoneTracker.signalDone();
    },
    [isDone]
  );

  const prevDoneTracker = useRef<DoneTracker>();

  useMemo(() => {
    if (prevDoneTracker.current !== localDoneTracker) resetDone?.();
    prevDoneTracker.current = localDoneTracker;
    // reset when there's a new done tracker
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localDoneTracker, resetDone]);

  // useLayoutEffect is used so the doneness can be detected before first paint
  useLayoutEffect(() => check(localDoneTracker), [check, localDoneTracker]);

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
