import React, { useState, useEffect } from "react";
import { DoneTrackedProps } from "../done-tracked";
import { DoneTracker } from "../done-tracker";
import { useDoneTracker } from "../done-tracker-hook";

export default function DelayedContainer(
  props: DoneTrackedProps<{
    delay: number;
    children: (doneTracker: DoneTracker) => any;
  }>
) {
  const localDoneTracker = useDoneTracker(props.doneTracker);
  const [delaying, setDelaying] = useState(true);

  useEffect(() => {
    if (!localDoneTracker) return;
    const timeoutId = setTimeout(() => {
      setDelaying(false);
    }, props.delay);
    return () => clearTimeout(timeoutId);
  }, [localDoneTracker, props.delay]);

  useEffect(() => {
    if (localDoneTracker && !delaying) localDoneTracker.signalDone();
  }, [localDoneTracker, delaying]);

  useEffect(() => setDelaying(true), [localDoneTracker]);

  const childrenWithProps = props.children(localDoneTracker);

  return <>{!delaying && childrenWithProps}</>;
}
