import { useEffect } from "react";
import { DoneTracker } from "./done-tracker-interface";

export const useDoneTrackerSubscription = (doneTracker: DoneTracker, {
  done,
  error,
}: {
  done?: () => void;
  error?: (err: any, source: DoneTracker) => void;
}) => {
  useEffect(() => {
    if (!done) return;
    const fn = () => done();
    doneTracker.addEventListener("done", fn);
    return () => doneTracker.removeEventListener("done", fn);
  }, [doneTracker, done]);

  useEffect(() => {
    if (!error) return;
    const fn = ([err, src]: [any, DoneTracker]) => error(err, src);
    doneTracker.addEventListener("error", fn);
    return () => doneTracker.removeEventListener("error", fn);
  }, [doneTracker, error]);
};
