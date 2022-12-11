import React, { useEffect, useState } from "react";
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
  const [delaying, setDelaying] = useState(true);

  const nodeDoneTracker = useNodeDoneTracker(props.doneTracker, {
    name: "DelayedContainer Node"
  });

  const delayDoneTracker = useLeafDoneTracker(nodeDoneTracker, {
    name: "DelayedContainer Delay",
    done: !delaying,
    reset: () => setDelaying(true),
  });

  const childrenDoneTracker = useNodeDoneTracker(nodeDoneTracker, {
    name: "DelayedContainer Children",
    willHaveChildren: true
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
