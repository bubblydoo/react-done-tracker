import React, { MutableRefObject, useReducer } from "react";
import { DoneTrackerProvider } from "../done-tracker-provider";
import { NodeDoneTracker } from "../node-done-tracker";
import { TrackComponentDoneProps } from "../track-component-done";
import { useDoneTrackerSubscription } from "../use-done-tracker-subscription";
import { useRootDoneTracker } from "../use-root-done-tracker";

export function ImperativeTrackDone({
  children,
  forceRefreshRef,
  doneTrackerName = "Root",
  onDone,
  onError,
  onPending,
  onChange,
}: TrackComponentDoneProps<{
  children: (doneTracker: NodeDoneTracker) => any;
  forceRefreshRef?: MutableRefObject<(() => void) | null>;
  doneTrackerName?: string;
}>) {
  const [tick, rerender] = useReducer((i: number) => i + 1, 0);
  if (forceRefreshRef) {
    forceRefreshRef.current = () => rerender();
  }

  const doneTracker = useRootDoneTracker(doneTrackerName, [tick]);

  useDoneTrackerSubscription(doneTracker, {
    done: onDone,
    error: onError,
    pending: onPending,
    change: onChange,
  });

  return (
    <DoneTrackerProvider doneTracker={doneTracker}>
      {children(doneTracker)}
    </DoneTrackerProvider>
  );
}
