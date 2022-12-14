import {
  DoneTracker,
  DoneTrackerEventMap,
  DoneTrackerListener,
} from "./done-tracker-interface";

export class BaseDoneTracker
  implements Pick<DoneTracker, "addEventListener" | "removeEventListener">
{
  doneListeners: DoneTrackerListener<"done">[] = [];
  abortListeners: DoneTrackerListener<"abort">[] = [];
  errorListeners: DoneTrackerListener<"error">[] = [];

  addEventListener: DoneTracker["addEventListener"] = (event, listener) => {
    if (event === "done") {
      this.doneListeners.push(listener as any);
    } else if (event === "abort") {
      this.abortListeners.push(listener as any);
    } else if (event === "error") {
      this.errorListeners.push(listener as any);
    }
  };

  removeEventListener: DoneTracker["removeEventListener"] = (
    event,
    listener
  ) => {
    if (event === "done") {
      this.doneListeners.splice(this.doneListeners.indexOf(listener as any), 1);
    } else if (event === "abort") {
      this.abortListeners.splice(
        this.abortListeners.indexOf(listener as any),
        1
      );
    } else if (event === "error") {
      this.errorListeners.splice(
        this.errorListeners.indexOf(listener as any),
        1
      );
    }
  };

  protected dispatchEvent<K extends keyof DoneTrackerEventMap>(
    event: K,
    ...arg: DoneTrackerEventMap[K]
  ) {
    if (event === "done") {
      this.doneListeners.forEach((fn) => fn(arg as any));
    } else if (event === "abort") {
      this.abortListeners.forEach((fn) => fn(arg as any));
    } else if (event === "error") {
      this.errorListeners.forEach((fn) => fn(arg as any));
    }
  }
}
