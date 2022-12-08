import { useCallback, useEffect, useMemo, useRef } from "react";
import { DoneTracker } from "./done-tracker";
import { useDoneTrackerRaw } from "./use-done-tracker-raw";

export const useDoneTracker = (
  doneTracker: DoneTracker,
  {
    name,
    isDone,
    resetDone,
    willHaveChildren,
    willBeSignaledDone
  }: {
    name?: string;
    isDone?: () => boolean;
    resetDone?: () => void;
    willHaveChildren?: boolean;
    willBeSignaledDone?: boolean
  } = {}
) => {
  const localDoneTracker = useDoneTrackerRaw(doneTracker, name);

  if (willHaveChildren === true) localDoneTracker.ensureWillHaveChildren();
  if (willHaveChildren === false) localDoneTracker.ensureWillHaveNoChildren();
  if (willBeSignaledDone === true) localDoneTracker.ensureWillBeSignaledDone();

  const check = useCallback(
    (localDoneTracker: DoneTracker) => {
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
