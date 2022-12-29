import React, { Suspense, useCallback, useState } from "react";
import { SuspenseProps, useLayoutEffect } from "react";
import { useLeafDoneTracker } from "../use-leaf-done-tracker";

function DetectDoneWrapper({
  onLoad,
  children,
}: {
  onLoad: () => void;
  children: any;
}) {
  useLayoutEffect(() => onLoad(), [onLoad]);
  return children;
}

export function DoneTrackedSuspense({ fallback, children }: SuspenseProps) {
  const [done, setDone] = useState(false);

  useLeafDoneTracker({ name: "DoneTrackedSuspense", done });

  return (
    <Suspense fallback={fallback}>
      <DetectDoneWrapper onLoad={useCallback(() => setDone(true), [])}>
        {children}
      </DetectDoneWrapper>
    </Suspense>
  );
}
