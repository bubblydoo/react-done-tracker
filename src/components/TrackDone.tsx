import React, { MutableRefObject, useEffect, useLayoutEffect, useReducer } from "react";
import { DoneTrackerListener } from "../done-tracker-interface";
import DoneTrackerProvider from "../done-tracker-provider";
import { TrackComponentDoneProps } from "../track-component-done";
import { useRootDoneTracker } from "../use-root-done-tracker";

export default function TrackDone({
  children,
  forceRefreshRef,
  doneTrackerName = "Root",
  onDone,
  onAbort,
  onError,
  onPending,
}: TrackComponentDoneProps<{
  children: any;
  forceRefreshRef?: MutableRefObject<(() => void) | null>;
  doneTrackerName?: string;
}>) {
  const [tick, rerender] = useReducer((i: number) => i + 1, 0);
  if (forceRefreshRef) {
    forceRefreshRef.current = () => rerender();
  }

  const doneTracker = useRootDoneTracker(doneTrackerName, [tick]);

  useEffect(() => {
    const onDoneFn: DoneTrackerListener<"done"> = (info) => onDone(info);
    const onAbortFn: DoneTrackerListener<"abort"> = (info) => onAbort(info);
    const onErrorFn: DoneTrackerListener<"error"> = (info) => onError(info);

    doneTracker.addEventListener("done", onDoneFn);
    doneTracker.addEventListener("abort", onAbortFn);
    doneTracker.addEventListener("error", onErrorFn);

    return () => {
      doneTracker.removeEventListener("done", onDoneFn);
      doneTracker.removeEventListener("abort", onAbortFn);
      doneTracker.removeEventListener("error", onErrorFn);
    };
  }, [onDone, onAbort, onError, doneTracker]);

  // use useLayoutEffect because useEffect is too slow
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => onPending?.(), [onPending, doneTracker]);

  return (
    <DoneTrackerProvider doneTracker={doneTracker}>
      {children}
    </DoneTrackerProvider>
  );
}
