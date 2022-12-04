import React, { useState, useEffect } from "react";
import { DoneTrackedProps } from "../done-tracked";
import { useDoneTracker } from "../done-tracker-hook";

export default function DelayedComponent(
  props: DoneTrackedProps<{ delay: number }>
) {
  const localDoneTracker = useDoneTracker(props.doneTracker);
  const [delaying, setDelaying] = useState(true);

  useEffect(() => {
    if (!localDoneTracker) return;
    const timeoutId = setTimeout(() => {
      localDoneTracker.signalDone();
      setDelaying(false);
    }, props.delay);
    return () => clearTimeout(timeoutId);
  }, [localDoneTracker, props.delay]);

  useEffect(() => setDelaying(true), [localDoneTracker]);

  return <div>{delaying ? "Delaying" : "Done"}</div>;
}
