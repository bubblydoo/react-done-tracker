import { useMemo, useEffect } from "react";
import { NodeDoneTracker } from "./node-done-tracker";
import { queueMicrotaskOrAsap } from "./queue-microtask-or-asap";

export const useTemporarilySkipNodeDoneTracker = (doneTracker: NodeDoneTracker, skip: boolean) => {
  useMemo(() => {
    // temporarily skip to prevent aborts from setting the node to done
    doneTracker.skip = true;
  }, [doneTracker]);

  useEffect(() => {
    // if the children are delayed, use the skip option
    if (skip) return;
    // queueMicrotask is needed to make sure this runs
    // after all the possibly aborted children (which also use useEffect)
    queueMicrotaskOrAsap(() => {
      doneTracker.skip = false;
      doneTracker.checkAndDispatchState();
    });
  }, [doneTracker, skip]);
}
