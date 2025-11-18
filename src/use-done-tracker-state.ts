import { useMemo, useSyncExternalStore } from "react";
import { DoneTracker } from "./done-tracker-interface";

export function useDoneTrackerState(
  doneTracker: DoneTracker
): DoneTrackerState {
  const store = useMemo(() => doneTrackerToStore(doneTracker), [doneTracker]);

  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );
}

export type DoneTrackerState =
  | {
      status: "done";
    }
  | {
      status: "errored";
      error: unknown;
      errorSource: DoneTracker | undefined;
    }
  | {
      status: "aborted";
    }
  | {
      status: "pending";
    };

type Subscribe = Parameters<typeof useSyncExternalStore>[0];

const DONE: DoneTrackerState = { status: "done" };
const ABORTED: DoneTrackerState = { status: "aborted" };
const PENDING: DoneTrackerState = { status: "pending" };

function doneTrackerToStore(doneTracker: DoneTracker) {
  const subscribe: Subscribe = (onStoreChange) => {
    console.log("Subscribing to done tracker", doneTracker.id);
    doneTracker.addEventListener("done", onStoreChange);
    doneTracker.addEventListener("error", onStoreChange);
    doneTracker.addEventListener("abort", onStoreChange);
    doneTracker.addEventListener("reset", onStoreChange);
    return () => {
      console.log("Unsubscribing from done tracker", doneTracker.id);
      doneTracker.removeEventListener("done", onStoreChange);
      doneTracker.removeEventListener("error", onStoreChange);
      doneTracker.removeEventListener("abort", onStoreChange);
      doneTracker.removeEventListener("reset", onStoreChange);
    };
  };

  let lastErrorState: DoneTrackerState | undefined = undefined;

  const getSnapshot = (): DoneTrackerState => {
    if (doneTracker.done) {
      return DONE;
    }
    if (doneTracker.errored) {
      if (
        lastErrorState &&
        lastErrorState.status === "errored" &&
        lastErrorState.error === doneTracker.error &&
        lastErrorState.errorSource === doneTracker.errorSource
      ) {
        return lastErrorState;
      }

      lastErrorState = {
        status: "errored",
        error: doneTracker.error,
        errorSource: doneTracker.errorSource,
      };

      return lastErrorState;
    }
    if (doneTracker.aborted) {
      return ABORTED;
    }
    return PENDING;
  };

  const getServerSnapshot = (): DoneTrackerState => {
    return PENDING;
  };

  return { subscribe, getSnapshot, getServerSnapshot };
}
