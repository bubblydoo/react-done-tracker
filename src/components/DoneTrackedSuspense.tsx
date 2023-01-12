import React, { Suspense, useCallback, useLayoutEffect, useState } from "react";
import { SuspenseProps } from "react";
import { useDoneTracker } from "../use-done-tracker";

function RunInUseEffect({
  onEffect,
  children,
}: {
  onEffect: () => void;
  children: any;
}) {
  // have to use useLayoutEffect because useEffect doesn't run when unsuspended
  // e.g. rendered (useEffect fires) -> suspended -> rendered (useEffect does not fire)
  useLayoutEffect(() => onEffect(), [onEffect]);
  return children;
}

export function DoneTrackedSuspense({ fallback, children }: SuspenseProps) {
  const [done, setDone] = useState(false);

  useDoneTracker({ name: "DoneTrackedSuspense", done });

  return (
    <Suspense
      fallback={
        <RunInUseEffect onEffect={useCallback(() => setDone(false), [])}>
          {fallback}
        </RunInUseEffect>
      }
    >
      <RunInUseEffect onEffect={useCallback(() => setDone(true), [])}>
        {children}
      </RunInUseEffect>
    </Suspense>
  );
}
