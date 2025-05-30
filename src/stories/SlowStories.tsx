import React, { useEffect, useState } from "react";
import { DoneTrackerProvider } from "../done-tracker-provider";
import { useDoneTracker } from "../use-done-tracker";
import { useNodeDoneTracker } from "../use-node-done-tracker";
import { doneTrackSlowHookWithDelay, doneTrackSlowHookWithEffectsDelay } from "../slow-hooks-util";
import { doneTrackHook } from "../hooks-util";

/**
 * This hook is "slow" because its loading state isn't updated immediately!
 * It will act like it's done before useEffect has triggered, only to then update the output
 */
const useSlow = (input: any) => {
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // the "useSlow" is an implicit loading state.
  // loading only becomes true after 1 useEffect cycle,
  // but it's actually already loading!
  // (this hook could be fixed by using `loading = loading || input !== output`)
  useEffect(() => {
    setLoading(true);
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setOutput(input);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [input]);

  return [output, loading] as const;
};

const useSlowFixed = doneTrackHook(useSlow, {
  isDone: (result, input) => input[0] === result[0],
});

const useSlowFixedWithDelay = doneTrackSlowHookWithDelay(useSlow, {
  delay: 100,
  argsEqual: (a, b) => a[0] === b[0],
});

const useSlowFixedWithEffectsDelay = doneTrackSlowHookWithEffectsDelay(
  useSlow,
  {
    waitEffects: 1,
    argsEqual: (a, b) => a[0] === b[0],
  }
);

const LoadAndPass = ({
  passToChildren,
  loading,
  children,
}: {
  passToChildren: number;
  loading: boolean;
  children: (passed: number) => any;
}) => {
  const done = !loading;

  const asyncOpDoneTracker = useDoneTracker({ name: "Slowness", done });
  const subtreeDoneTracker = useNodeDoneTracker({
    name: "Subtree",
    skip: loading,
  });

  subtreeDoneTracker.checkAndDispatchState();

  useEffect(() => {
    subtreeDoneTracker.checkAndDispatchState();
  }, [subtreeDoneTracker, asyncOpDoneTracker.done, passToChildren]);

  return (
    <div style={{ padding: 4, marginTop: 4, border: "1px solid black" }}>
      <DoneTrackerProvider doneTracker={subtreeDoneTracker}>
        passing: {passToChildren}
        {children(passToChildren)}
      </DoneTrackerProvider>
    </div>
  );
};

const ImmediatelyDone = ({ children }: { children: any }) => {
  useDoneTracker({ name: "ImmediatelyDone", done: true });

  return <div>{children}</div>;
};

export const Tree = () => {
  const [passed, setPassed] = useState(1);

  // this hook is "slow" because its loading state isn't updated immediately!
  const [slowPassed, slowLoading] = useSlow(passed);
  const [verySlowPassed, verySlowLoading] = useSlow(slowPassed);

  return (
    <>
      <div>current: {passed}</div>
      <button onClick={() => setPassed(passed => passed + 1)}>
        increment
      </button>
      <LoadAndPass passToChildren={passed} loading={false}>
        {(passed) => <ImmediatelyDone>immediate: {passed}</ImmediatelyDone>}
      </LoadAndPass>
      <LoadAndPass passToChildren={slowPassed} loading={slowLoading}>
        {(passed) => (
          <ImmediatelyDone>slow (1 useEffect): {passed}</ImmediatelyDone>
        )}
      </LoadAndPass>
      <LoadAndPass
        passToChildren={verySlowPassed}
        loading={verySlowLoading || slowLoading}
      >
        {(passed) => (
          <ImmediatelyDone>
            very slow (2 useEffects delay): {passed}
          </ImmediatelyDone>
        )}
      </LoadAndPass>
    </>
  );
};

export const TreeFixed = () => {
  const [passed, setPassed] = useState(1);

  const [slowPassed, slowLoading] = useSlowFixed(passed);
  const [verySlowPassed, verySlowLoading] = useSlowFixed(slowPassed);

  return (
    <>
      <div>current: {passed}</div>
      <button onClick={() => setPassed(passed => passed + 1)}>
        increment
      </button>
      <LoadAndPass passToChildren={passed} loading={false}>
        {(passed) => <ImmediatelyDone>immediate: {passed}</ImmediatelyDone>}
      </LoadAndPass>
      <LoadAndPass passToChildren={slowPassed} loading={slowLoading}>
        {(passed) => (
          <ImmediatelyDone>slow (1 useEffect): {passed}</ImmediatelyDone>
        )}
      </LoadAndPass>
      <LoadAndPass
        passToChildren={verySlowPassed}
        loading={verySlowLoading || slowLoading}
      >
        {(passed) => (
          <ImmediatelyDone>
            very slow (2 useEffects delay): {passed}
          </ImmediatelyDone>
        )}
      </LoadAndPass>
    </>
  );
};

export const TreeFixedWithEffectsDelay = () => {
  const [passed, setPassed] = useState(1);

  const [slowPassed, slowLoading] = useSlowFixedWithEffectsDelay(passed);
  const [verySlowPassed, verySlowLoading] =
    useSlowFixedWithEffectsDelay(slowPassed);

  return (
    <>
      <div>current: {passed}</div>
      <button onClick={() => setPassed(passed => passed + 1)}>
        increment
      </button>
      <LoadAndPass passToChildren={passed} loading={false}>
        {(passed) => <ImmediatelyDone>immediate: {passed}</ImmediatelyDone>}
      </LoadAndPass>
      <LoadAndPass passToChildren={slowPassed} loading={slowLoading}>
        {(passed) => (
          <ImmediatelyDone>slow (1 useEffect): {passed}</ImmediatelyDone>
        )}
      </LoadAndPass>
      <LoadAndPass
        passToChildren={verySlowPassed}
        loading={verySlowLoading || slowLoading}
      >
        {(passed) => (
          <ImmediatelyDone>
            very slow (2 useEffects delay): {passed}
          </ImmediatelyDone>
        )}
      </LoadAndPass>
    </>
  );
};

export const TreeFixedWithDelay = () => {
  const [passed, setPassed] = useState(1);

  const [slowPassed, slowLoading] = useSlowFixedWithDelay(passed);
  const [verySlowPassed, verySlowLoading] = useSlowFixedWithDelay(slowPassed);

  return (
    <>
      <div>current: {passed}</div>
      <button onClick={() => setPassed(passed => passed + 1)}>
        increment
      </button>
      <LoadAndPass passToChildren={passed} loading={false}>
        {(passed) => <ImmediatelyDone>immediate: {passed}</ImmediatelyDone>}
      </LoadAndPass>
      <LoadAndPass passToChildren={slowPassed} loading={slowLoading}>
        {(passed) => (
          <ImmediatelyDone>slow (1 useEffect): {passed}</ImmediatelyDone>
        )}
      </LoadAndPass>
      <LoadAndPass
        passToChildren={verySlowPassed}
        loading={verySlowLoading || slowLoading}
      >
        {(passed) => (
          <ImmediatelyDone>
            very slow (2 useEffects delay): {passed}
          </ImmediatelyDone>
        )}
      </LoadAndPass>
    </>
  );
};
