import React, { useEffect, useState } from "react";
import { ImperativeDoneTrackedProps } from "../imperative-done-tracked";
import { useImperativeDoneTracker } from "../use-imperative-done-tracker";

export default function ImperativeDelayedComponent(
  props: ImperativeDoneTrackedProps<{ delay: number, persist?: true }>
) {
  const [delaying, setDelaying] = useState(true);

  const doneTracker = useImperativeDoneTracker(props.doneTracker, {
    name: "DelayedComponent",
    done: !delaying,
  });

  useEffect(() => props.persist ? undefined : setDelaying(true), [doneTracker, props.persist]);

  const [start, setStart] = useState<number>(Infinity);
  const [left, setLeft] = useState<number>(Infinity);

  const end = start + props.delay;

  useEffect(() => {
    if (!doneTracker) return;
    const timeoutId = setTimeout(() => {
      setDelaying(false);
    }, props.delay);
    setStart(+new Date());
    return () => clearTimeout(timeoutId);
  }, [doneTracker, props.delay]);

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
