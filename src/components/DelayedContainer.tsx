import { useState, useEffect } from "react";
import DoneTrackerProvider from "../done-tracker-provider";
import { useImperativeLeafDoneTracker } from "../use-imperative-leaf-done-tracker";
import { useImperativeNodeDoneTracker } from "../use-imperative-node-done-tracker";
import { useNodeDoneTracker } from "../use-node-done-tracker";
import React from "react";

interface Props {
  children: any;
  delay: number;
}

export default function DelayedContainer(props: Props) {
  const [delaying, setDelaying] = useState(true);

  const doneTracker = useNodeDoneTracker();
  const childrenDoneTracker = useImperativeNodeDoneTracker(doneTracker, { willHaveChildren: true });
  const delayDoneTracker = useImperativeLeafDoneTracker(doneTracker, {
    done: !delaying,
    reset: () => setDelaying(true),
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

  if (delaying) return `Loading: ${!left ? "Loading" : format(left)}s left`;

  return (
    <DoneTrackerProvider doneTracker={childrenDoneTracker}>
      {props.children}
    </DoneTrackerProvider>
  );
}
