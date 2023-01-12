import { useEffect } from "react";
import { DoneTracker } from "./done-tracker-interface";
import { queueMicrotaskOrAsap } from "./queue-microtask-or-asap";

export const useDoneTrackerSubscription = (
  doneTracker: DoneTracker,
  {
    done,
    error,
    pending,
  }: {
    done?: () => void;
    error?: (err: any, source: DoneTracker) => void;
    pending?: () => void;
  }
) => {
  useEffect(() => {
    let ignore = false;
    // this queueMicrotask is needed because in Strict Mode
    // we sometimes see pending -> done -> pending -> done
    // (e.g. rarely in the ImmediatelyDone story)
    // (this also occurs with useLayoutEffect)
    // also it skips pending when it's within 1 microtask which
    // can be desirable
    queueMicrotaskOrAsap(() => {
      if (ignore) return;
      if (doneTracker.aborted || doneTracker.errored || doneTracker.done)
        return;
      pending?.();
    });

    return () => {
      ignore = true;
    };
  }, [doneTracker, pending]);

  // we cannot use useLayoutEffect here because
  // it has to be the same as in useImperativeDoneTracker

  useEffect(() => {
    if (!done) return;
    const fn = () => done();
    if (doneTracker.done) done();
    doneTracker.addEventListener("done", fn);
    return () => doneTracker.removeEventListener("done", fn);
  }, [doneTracker, done]);

  useEffect(() => {
    if (!error) return;
    const fn = ([err, src]: [any, DoneTracker]) => error(err, src);
    if (doneTracker.error) error(doneTracker.error, doneTracker.errorSource!);
    doneTracker.addEventListener("error", fn);
    return () => doneTracker.removeEventListener("error", fn);
  }, [doneTracker, error]);

  useEffect(() => {
    if (!pending) return;
    const fn = () => pending();
    doneTracker.addEventListener("reset", fn);
    return () => doneTracker.removeEventListener("reset", fn);
  }, [doneTracker, pending]);
};
