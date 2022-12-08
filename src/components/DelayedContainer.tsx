import React, { useEffect, useCallback, useRef, useState } from "react";
import { DoneTrackedProps } from "../done-tracked";
import { NodeDoneTracker } from "../node-done-tracker";
import { useLeafDoneTracker } from "../use-leaf-done-tracker";
import { useNodeDoneTracker } from "../use-node-done-tracker";

export default function DelayedContainer(
  props: DoneTrackedProps<{
    delay: number;
    children: (doneTracker: NodeDoneTracker) => any;
  }>
) {
  const delaying = useRef(true);

  const [nodeDoneTracker] = useNodeDoneTracker(props.doneTracker, {
    name: "DelayedContainer Node"
  });

  const [delayDoneTracker, { check }] = useLeafDoneTracker(nodeDoneTracker, {
    name: "DelayedContainer Delay",
    isDone: useCallback(() => !delaying.current, []),
    resetDone: useCallback(() => (delaying.current = true), []),
  });

  const [childrenDoneTracker] = useNodeDoneTracker(nodeDoneTracker, {
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
