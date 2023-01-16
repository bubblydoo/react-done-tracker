import { useMemo, useEffect } from "react";
import { alwaysWarn, debug } from "./log";
import { NodeDoneTracker } from "./node-done-tracker";
import { queueMicrotaskOrAsap } from "./queue-microtask-or-asap";

export const useTemporarilySkipNodeDoneTracker = (
  doneTracker: NodeDoneTracker,
  skip: boolean
) => {
  useMemo(() => {
    // temporarily skip to prevent aborts from setting the node to done
    doneTracker.skip = true;
  }, [doneTracker]);

  useMemo(() => {
    if (skip) {
      // turn on skip when skip becomes true
      // TODO: verify if this is really necessary (do we need to turn on skip again on repending?)
      // and add a test case for it
      debug("Setting skip because it became true", doneTracker.id);
      doneTracker.skip = true;
    }
  }, [doneTracker, skip]);

  useEffect(() => {
    // if the children are delayed, use the skip option
    if (skip) {
      const diff = doneTracker.doneAt && performance.now() - doneTracker.doneAt;
      if (diff && diff < 100) {
        alwaysWarn(
          "Done tracker",
          doneTracker.id,
          `was done and then reset again in ${diff}ms.`,
          "This is very fast and likely imperceptible, and unlikely to be desired.",
          "Make sure you're not using any slow hooks."
        );
      }
      if (doneTracker.done || doneTracker.errored) {
        // reset when skip becomes true
        // TODO: verify if this is really necessary and add a test case for it
        debug("Resetting because skip became true", doneTracker.id);
        doneTracker.reset();
      }
      return;
    }
    // queueMicrotask is needed to make sure this runs
    // after the double render and thus
    // after all the possibly aborted/reset children (which also use useEffect)
    queueMicrotaskOrAsap(() => {
      debug("Unsetting skip", doneTracker.id);
      doneTracker.skip = false;
      doneTracker.checkAndDispatchState();
    });
  }, [doneTracker, skip]);
};
