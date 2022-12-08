import React, { useEffect, useCallback, useRef, useState } from "react";
import { DoneTrackedProps } from "../done-tracked";
import { DoneTracker } from "../done-tracker";
import { useDoneTracker } from "../use-done-tracker";

export default function DelayedContainer(
  props: DoneTrackedProps<{
    delay: number;
    children: (doneTracker: DoneTracker) => any;
  }>
) {
  const delaying = useRef(true);

  const [nodeDoneTracker] = useDoneTracker(props.doneTracker, {
    name: "DelayedContainer Node",
    willHaveChildren: true,
  });

  const [delayDoneTracker, { check }] = useDoneTracker(nodeDoneTracker, {
    name: "DelayedContainer Delay",
    isDone: useCallback(() => !delaying.current, []),
    resetDone: useCallback(() => (delaying.current = true), []),
    willBeSignaledDone: true
  });

  const [childrenDoneTracker] = useDoneTracker(nodeDoneTracker, {
    name: "DelayedContainer Children",
    willHaveChildren: true
  });

  const [start, setStart] = useState<number>(Infinity);
  const [left, setLeft] = useState<number>(Infinity);

  const end = start + props.delay;

  useEffect(() => {
    if (!delayDoneTracker) return;
    const timeoutId = setTimeout(() => {
      delaying.current = false;
      check();
    }, props.delay);
    setStart(+new Date());
    return () => clearTimeout(timeoutId);
  }, [delayDoneTracker, props.delay, check]);

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

  const { format } = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  });

  const childrenComponents = props.children?.(childrenDoneTracker);

  return (
    <>
      <div>
        {delayDoneTracker.done
          ? "Done"
          : `Loading: ${!left ? "Loading" : format(left)}s left`}
      </div>
      <div>{delayDoneTracker.done && childrenComponents}</div>
    </>
  );
}
