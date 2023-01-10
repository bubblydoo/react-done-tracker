import {
  useDebugValue,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { DoneTrackerError } from "./done-tracker-error";
import { DoneTracker } from "./done-tracker-interface";
import { LeafDoneTracker } from "./leaf-done-tracker";
import { NodeDoneTracker } from "./node-done-tracker";

/**
 * Keeps track of number of how many times a done tracker has been added in an effect.
 * A done tracker can only be aborted when references = 0.
 * This is needed because of strict mode.
 */
const referenceCounter = new WeakMap<DoneTracker, number>();

const decreaseRefs = (doneTracker: DoneTracker) => {
  const count = (referenceCounter.get(doneTracker) || 0) - 1;
  referenceCounter.set(doneTracker, count);
  return count;
};

const increaseRefs = (doneTracker: DoneTracker) => {
  const count = (referenceCounter.get(doneTracker) || 0) + 1;
  referenceCounter.set(doneTracker, count);
  return count;
};

export function useDoneTrackerRaw<
  T extends "node" | "leaf",
  D extends DoneTracker = T extends "node" ? NodeDoneTracker : LeafDoneTracker
>(doneTracker: NodeDoneTracker, type: T, name?: string): D {
  if (!doneTracker) {
    throw new DoneTrackerError(
      "Falsy done tracker passed to useDoneTrackerRaw"
    );
  }

  const [, rerender] = useReducer((i: number) => i + 1, 0);

  const unsubscribeFromPrevious = useRef<() => void>();

  const localDoneTracker = useMemo<D>(
    () => {
      unsubscribeFromPrevious.current?.();

      const doneTracker =
        type === "node" ? new NodeDoneTracker(name) : new LeafDoneTracker(name);
      doneTracker.addEventListener("done", rerender);
      doneTracker.addEventListener("abort", rerender);
      doneTracker.addEventListener("error", rerender);

      unsubscribeFromPrevious.current = () => {
        doneTracker.removeEventListener("done", rerender);
        doneTracker.removeEventListener("abort", rerender);
        doneTracker.removeEventListener("error", rerender);
      };
      return doneTracker as any;
    },
    // doneTracker needs to be in here!
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name, type, doneTracker]
  );

  useDebugValue(
    `Doneness of ${name}: ${
      localDoneTracker.aborted
        ? "aborted"
        : localDoneTracker.done
        ? "done"
        : localDoneTracker.errored
        ? `errored: ${localDoneTracker.error}`
        : "pending"
    }`
  );

  // use useLayoutEffect because useEffect is too slow
  // TODO: could we use useEffect here?
  useLayoutEffect(() => {
    increaseRefs(localDoneTracker);
    doneTracker.add(localDoneTracker);

    return () => {
      // Make sure we abort the previous done tracker after we added the next one,
      // so the parent never has no children.
      //
      // This is the order we want:
      // 1. parent.add(child1) -> first render
      // 2. parent.add(child2) -> double render
      // 3. child1.abort()
      //
      // Without queueMicrotask, step 2 and 3 would be switched.
      //
      // Next to that, it should work if child1 === child2.
      // (this effect will be ran twice with the same done tracker)
      //
      // 1. parent.add(child) -> references = 1
      // 2. parent.add(child) -> references = 2
      // 3. effect teardown -> references = 1
      // 4. effect teardown -> references = 0 -> child.abort()
      //
      // Double-renders in React run in the same microtask, so queueMicrotask should be enough
      // https://github.dev/facebook/react/blob/645ae2686b157c9f80193e1ada75b7e00ef49acf/packages/react-reconciler/src/ReactFiberHooks.js#L527
      // and https://stackblitz.com/edit/react-gwohwc?file=src%2FApp.js
      queueMicrotask(() => {
        const references = decreaseRefs(localDoneTracker);

        if (!localDoneTracker.done && references <= 0) {
          localDoneTracker.abort();
        }
      });
    };
  }, [doneTracker, localDoneTracker]);

  return localDoneTracker;
}
