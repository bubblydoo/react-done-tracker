import { useLayoutEffect } from "react";
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
  // use useLayoutEffect because useEffect is too slow

  useLayoutEffect(() => {
    if (!done) return;
    const fn = () => done();
    if (doneTracker.done) done();
    doneTracker.addEventListener("done", fn);
    return () => doneTracker.removeEventListener("done", fn);
  }, [doneTracker, done]);

  useLayoutEffect(() => {
    if (!error) return;
    const fn = ([err, src]: [any, DoneTracker]) => error(err, src);
    if (doneTracker.error) error(doneTracker.error, doneTracker.errorSource!);
    doneTracker.addEventListener("error", fn);
    return () => doneTracker.removeEventListener("error", fn);
  }, [doneTracker, error]);

  useLayoutEffect(() => {
    if (doneTracker.aborted || doneTracker.errored || doneTracker.done) return;
    pending?.();
  }, [doneTracker, pending]);
};
