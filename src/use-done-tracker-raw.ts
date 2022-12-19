import { useDebugValue, useEffect, useMemo, useReducer, useRef } from "react";
import { DoneTrackerError } from "./done-tracker-error";
import { DoneTracker } from "./done-tracker-interface";
import { LeafDoneTracker } from "./leaf-done-tracker";
import { NodeDoneTracker } from "./node-done-tracker";

export function useDoneTrackerRaw<
  T extends "node" | "leaf",
  D extends DoneTracker = T extends "node" ? NodeDoneTracker : LeafDoneTracker
>(doneTracker: NodeDoneTracker, type: T, name?: string): D {
  if (!doneTracker) throw new DoneTrackerError("Falsy done tracker passed to useDoneTrackerRaw");

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
      }
      return doneTracker as any;
    },
    // doneTracker needs to be in here!
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name, doneTracker]
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

  useEffect(() => {
    console.log("new local done tracker", type, localDoneTracker.id);
    localDoneTracker.setup();
    doneTracker.add(localDoneTracker);

    return () => {
      if (!localDoneTracker.done) localDoneTracker.abort();
    };
  }, [doneTracker, localDoneTracker, type]);

  return localDoneTracker;
}
