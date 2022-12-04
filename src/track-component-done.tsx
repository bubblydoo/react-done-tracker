/* eslint-disable react/display-name */
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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

const logChangeErr = (prop: string) =>
  console.error(
    `${prop} changed, this is not supported. Please use "useCallback" around this function in the parent component`
  );

export function trackComponentDone(
  Component: any,
  forceRefreshRef: { current: (() => void) | null }
) {
  return React.forwardRef<unknown, Props>(
    ({ onDone, onAbort, onError, onPending, ...props }: any, ref) => {
      const [tick, setTick] = useState(0);
      if (forceRefreshRef) {
        forceRefreshRef.current = () => setTick((i) => i + 1);
      }
      useEffectSkipFirst(() => logChangeErr("onDone"), [onDone]);
      useEffectSkipFirst(() => logChangeErr("onAbort"), [onAbort]);
      useEffectSkipFirst(() => logChangeErr("onError"), [onError]);
      useEffectSkipFirst(() => logChangeErr("onPending"), [onPending]);
      const doneTracker = useMemo(
        () => new DoneTracker(onDone, onAbort, onError, "Root"),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [tick, ...Object.values(props)]
      );
      // use useMemo because useEffect is too slow
      // eslint-disable-next-line react-hooks/exhaustive-deps
      useMemo(() => onPending(), [doneTracker])
      return (
        <Component {...props} doneTracker={doneTracker} ref={ref}></Component>
      );
    }
  );
}
