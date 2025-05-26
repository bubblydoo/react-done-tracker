import React, {
  Suspense as OrigSuspense,
  useCallback,
  useLayoutEffect,
  useState,
} from "react";
import { SuspenseProps } from "react";
import { useDoneTracker } from "../use-done-tracker";

export function DoneTrackedSuspense(props: SuspenseProps) {
  const { loaded, SuspenseWithState } = useSuspenseWithState();

  useDoneTracker({ name: "DoneTrackedSuspense", done: loaded });

  return <SuspenseWithState {...props} />;
}

function RunInUseEffect({ onEffect }: { onEffect: () => void }) {
  // have to use useLayoutEffect because useEffect doesn't run when unsuspended
  // e.g. rendered (useEffect fires) -> suspended -> rendered (useEffect does not fire)
  useLayoutEffect(() => onEffect(), [onEffect]);
  return null;
}

/** Hook that returns a Suspense component that is synced with a state */
function useSuspenseWithState() {
  const [loaded, setLoaded] = useState(false);

  const setLoadedFalse = useCallback(() => setLoaded(false), []);
  const setLoadedTrue = useCallback(() => setLoaded(true), []);

  const SuspenseWithState = useCallback(
    ({ fallback, children }: SuspenseProps) => (
      <OrigSuspense
        fallback={
          <>
            <RunInUseEffect onEffect={setLoadedFalse} />
            {fallback}
          </>
        }
      >
        <RunInUseEffect onEffect={setLoadedTrue} />
        {children}
      </OrigSuspense>
    ),
    [setLoadedFalse, setLoadedTrue]
  );

  return { loaded, SuspenseWithState };
}
