import { useEffect } from "react";
import { DoneTracker } from "./done-tracker-interface";

export const useDoneTrackerSubscription = (doneTracker: DoneTracker, {
  done,
  error,
  pending
}: {
  done?: () => void;
  error?: (err: any, source: DoneTracker) => void;
  pending?: () => void;
}) => {
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
    if (doneTracker.aborted || doneTracker.errored || doneTracker.done) return;
    pending?.();
  }, [doneTracker, pending]);
};
