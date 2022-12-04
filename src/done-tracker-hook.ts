import { useEffect, useMemo, useReducer } from "react";
import { DoneTracker } from "./done-tracker";

const DEBUG = true;

export const useDoneTracker = (doneTracker: DoneTracker, name?: string) => {
  doneTracker.ensureWillHaveChildren();

  const [, tick] = useReducer((i: number) => i + 1, 0);

  const localDoneTracker = useMemo(() => {
    const localDoneTracker = doneTracker.forkChild(
      () => tick(),
      () => tick(),
      () => tick(),
      name
    );
    if (DEBUG) console.log("Forked", doneTracker.id, "->", localDoneTracker.id);
    return localDoneTracker;
  }, [doneTracker, name])

  useEffect(() => {
    return () => localDoneTracker.abort();
  }, [localDoneTracker]);

  return localDoneTracker;
};
