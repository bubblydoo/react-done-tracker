import React, { useMemo, useReducer, useRef } from "react";
import { NodeDoneTracker } from "./node-done-tracker";

interface Props {
  onDone: () => any;
  onAbort: () => any;
  onError: (err: any, source: any) => any;
  onPending: () => any;
}

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

    const unsubscribeFromPrevious = useRef<() => void>();

    const doneTracker = useMemo(
      () => {
        unsubscribeFromPrevious.current?.();

        const dt = new NodeDoneTracker("Root");
        console.log("creating new root", dt.id);
        dt.addEventListener("done", onDone);
        dt.addEventListener("abort", onAbort);
        dt.addEventListener("error", onError);

        unsubscribeFromPrevious.current = () => {
          doneTracker.removeEventListener("done", rerender);
          doneTracker.removeEventListener("abort", rerender);
          doneTracker.removeEventListener("error", rerender);
        }
        // dt.setWillHaveChildren(true);
        return dt;
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [tick, onDone, onAbort, onError, ...Object.values(props)]
    );
    // use useMemo because useEffect is too slow
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useMemo(() => onPending?.(), [onPending, doneTracker]);
    return (
      <Component {...props} doneTracker={doneTracker} ref={ref}></Component>
    );
  });
}
