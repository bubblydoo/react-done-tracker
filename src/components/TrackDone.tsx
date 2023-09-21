import React, { MutableRefObject, useContext, useReducer } from "react";
import { DoneTrackerProvider } from "../done-tracker-provider";
import { TrackComponentDoneProps } from "../track-component-done";
import { useDoneTrackerSubscription } from "../use-done-tracker-subscription";
import { useRootDoneTracker } from "../use-root-done-tracker";
import { DoneTrackerContext } from "../done-tracker-context";
import { useNodeDoneTracker } from "../use-node-done-tracker";

export function TrackDoneRoot({
  children,
  forceRefreshRef,
  doneTrackerName = "Root",
  onDone,
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

  useDoneTrackerSubscription(doneTracker, {
    done: onDone,
    error: onError,
    pending: onPending,
  });

  return (
    <DoneTrackerProvider doneTracker={doneTracker}>
      {children}
    </DoneTrackerProvider>
  );
}

export function ForkedTrackDone({
  name,
  children,
  onDone,
  onError,
  onPending,
  forceRefreshRef,
}: TrackComponentDoneProps<{
  name: string;
  children: any;
  forceRefreshRef?: MutableRefObject<(() => void) | null>;
}>) {
  const [tick, rerender] = useReducer((i: number) => i + 1, 0);
  if (forceRefreshRef) {
    forceRefreshRef.current = () => rerender();
  }

  const doneTracker = useNodeDoneTracker({ name });

  useDoneTrackerSubscription(doneTracker, {
    done: onDone,
    error: onError,
    pending: onPending,
  });

  return (
    <DoneTrackerProvider doneTracker={doneTracker}>
      {children}
    </DoneTrackerProvider>
  );
}

export function TrackDone({
  children,
  forceRoot = false,
  forceRefreshRef,
  doneTrackerName = "Root",
  onDone,
  onError,
  onPending,
}: TrackComponentDoneProps<{
  children: any;
  forceRoot: boolean;
  forceRefreshRef?: MutableRefObject<(() => void) | null>;
  doneTrackerName?: string;
}>) {
  const hasDoneTrackerParent = !!useContext(DoneTrackerContext);

  if (hasDoneTrackerParent && !forceRoot) {
    return (
      <ForkedTrackDone
        name={doneTrackerName}
        forceRefreshRef={forceRefreshRef}
        onDone={onDone}
        onError={onError}
        onPending={onPending}
      >
        {children}
      </ForkedTrackDone>
    );
  }

  return (
    <TrackDoneRoot
      doneTrackerName={doneTrackerName}
      forceRefreshRef={forceRefreshRef}
      onDone={onDone}
      onError={onError}
      onPending={onPending}
    >
      {children}
    </TrackDoneRoot>
  );
}
