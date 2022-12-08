/* eslint-disable react/display-name */
import React, { useEffect, useMemo, useReducer, useRef } from "react";
import { DoneTracker } from "./done-tracker";

interface Props {
  onDone: () => any;
  onAbort: () => any;
  onError: (err: any, source: any) => any;
  onPending: () => any;
}

const useEffectSkipFirst: typeof useEffect = (cb, deps) => {
  const mounted = useRef(true);

  useEffect(() => {
    if (!mounted.current) {
      return cb();
    }
    mounted.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export function trackComponentDone(
  Component: any,
  forceRefreshRef: { current: (() => void) | null }
) {
  return React.forwardRef<unknown, Props>(function TrackComponentDone(
    { onDone, onAbort, onError, onPending, ...props }: any,
    ref
  ) {
    const [tick, rerender] = useReducer((i: number) => i + 1, 0);
    if (forceRefreshRef) {
      forceRefreshRef.current = () => rerender();
    }
    const doneTracker = useMemo(
      () => new DoneTracker(onDone, onAbort, onError, "Root"),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [tick, onDone, onAbort, onError, ...Object.values(props)]
    );
    doneTracker.ensureWillHaveChildren();
    // use useMemo because useEffect is too slow
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useMemo(() => onPending?.(), [onPending, doneTracker]);
    return (
      <Component {...props} doneTracker={doneTracker} ref={ref}></Component>
    );
  });
}
