import { useEffect, useMemo, useReducer } from "react";
import { DoneTracker } from "./done-tracker";

export const useDoneTrackerRaw = (doneTracker: DoneTracker, name?: string) => {
  const [, rerender] = useReducer((i: number) => i + 1, 0);

  const localDoneTracker = useMemo<DoneTracker>(
    () => new DoneTracker(rerender, rerender, rerender, name),
    // doneTracker needs to be in here!
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name, doneTracker]
  );

  useEffect(() => {
    console.log('new local done tracker', localDoneTracker.id)
    localDoneTracker.setup();
    doneTracker.add(localDoneTracker);

    return () => {
      if (!localDoneTracker.done) localDoneTracker.abort();
    }
  }, [doneTracker, localDoneTracker]);

  return localDoneTracker;
};
