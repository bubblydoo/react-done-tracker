import React, { useEffect, useRef, useCallback, useState } from "react";
import { DoneTrackedProps } from "../done-tracked";
import { useLeafDoneTracker } from "../use-leaf-done-tracker";

export default function DelayedComponent(
  props: DoneTrackedProps<{ delay: number }>
) {
  const delaying = useRef(true);

  const [doneTracker, { check }] = useLeafDoneTracker(props.doneTracker, {
    name: "DelayedComponent",
    isDone: useCallback(() => !delaying.current, []),
    resetDone: useCallback(() => (delaying.current = true), [])
  });

  const [start, setStart] = useState<number>(Infinity);
  const [left, setLeft] = useState<number>(Infinity);

  const end = start + props.delay;

  useEffect(() => {
    if (!doneTracker) return;
    const timeoutId = setTimeout(() => {
      doneTracker.signalDone();
      delaying.current = false;
      check();
    }, props.delay);
    setStart(+new Date());
    return () => clearTimeout(timeoutId);
  }, [doneTracker, props.delay, check]);

  useEffect(() => {
    if (!start) return;
    if (end < +new Date()) return;
    const fn = () => {
      setLeft((start + props.delay - +new Date()) / 1000);
      requestAnimationFrame(fn);
    };
    const rafId = requestAnimationFrame(fn);
    return () => cancelAnimationFrame(rafId);
  }, [start, end, props.delay]);

  const { format } = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1
  });

  return <div>{doneTracker.done ? "Done" : `Loading: ${!left ? "Loading" : format(left)}s left`}</div>;
}
