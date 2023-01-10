import React, { useEffect, useState } from "react";
import { ImperativeDoneTrackedProps } from "../imperative-done-tracked";
import { NodeDoneTracker } from "../node-done-tracker";
import { useImperativeLeafDoneTracker } from "../use-imperative-leaf-done-tracker";
import { useImperativeNodeDoneTracker } from "../use-imperative-node-done-tracker";

export default function ImperativeDelayedContainer(
  props: ImperativeDoneTrackedProps<{
    delay: number;
    children: (doneTracker: NodeDoneTracker) => any;
  }>
) {
  const [delaying, setDelaying] = useState(true);

  const nodeDoneTracker = useImperativeNodeDoneTracker(props.doneTracker, {
    name: "DelayedContainer Node"
  });

  const delayDoneTracker = useImperativeLeafDoneTracker(nodeDoneTracker, {
    name: "DelayedContainer Delay",
    done: !delaying,
    reset: () => setDelaying(true),
  });

  const childrenDoneTracker = useImperativeNodeDoneTracker(nodeDoneTracker, {
    name: "DelayedContainer Children",
    skip: !delayDoneTracker.done,
  });

  const [start, setStart] = useState<number>(Infinity);
  const [left, setLeft] = useState<number>(Infinity);

  const end = start + props.delay;

  useEffect(() => {
    if (!delayDoneTracker) return;
    const timeoutId = setTimeout(() => {
      setDelaying(false);
    }, props.delay);
    setStart(+new Date());
    return () => clearTimeout(timeoutId);
  }, [delayDoneTracker, props.delay]);

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
