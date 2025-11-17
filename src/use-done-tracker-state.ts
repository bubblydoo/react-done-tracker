import { useMemo, useSyncExternalStore } from "react";
import { DoneTracker } from "./done-tracker-interface";

export function useDoneTrackerState(doneTracker: DoneTracker): DoneTrackerState {
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

  const errorStateMap = new StrongAndWeakMap<DoneTrackerState>();

  const getSnapshot = (): DoneTrackerState => {
    if (doneTracker.done) {
      return DONE;
    }
    if (doneTracker.errored) {
      const existing = errorStateMap.get(doneTracker.error);

      if (existing) {
        return existing;
      }

      const newState: DoneTrackerState = {
        status: "errored",
        error: doneTracker.error,
        errorSource: doneTracker.errorSource,
      };

      errorStateMap.set(doneTracker.error, newState);

      return newState;
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

class StrongAndWeakMap<T> {
  private weakMap = new WeakMap<object, T>();
  private map = new Map<unknown, T>();

  private selectMap(key: unknown): Map<unknown, T> {
    if (typeof key === 'object' && key !== null) {
      return this.weakMap as Map<object, T>;
    }
    console.error("The errors thrown to done trackers should be objects, not primitives. This may cause issues with useDoneTrackerState.");
    return this.map;
  }

  has(key: unknown): boolean {
    return this.selectMap(key).has(key);
  }

  get(key: unknown): T | undefined {
    return this.selectMap(key).get(key);
  }

  set(key: unknown, value: T) {
    this.selectMap(key).set(key, value);
  }

  delete(key: unknown) {
    this.selectMap(key).delete(key);
  }
}
