export interface DoneTrackerEventMap {
  "done": [],
  "abort": [],
  "error": [any, DoneTracker]
}

export type DoneTrackerListener<K extends keyof DoneTrackerEventMap> = (data: DoneTrackerEventMap[K]) => any

/**
 * Keeps track of "doneness" of a component tree
 * A DoneTracker is done when all of its children are done
 */
export interface DoneTracker {
  readonly id: string | number;
  readonly done: boolean;
  name: string | undefined;
  readonly aborted: boolean;
  readonly errored: boolean;
  readonly error: any;
  readonly errorSource: DoneTracker | undefined;

  addEventListener<K extends keyof DoneTrackerEventMap>(event: K, listener: DoneTrackerListener<K>): void;

  removeEventListener<K extends keyof DoneTrackerEventMap>(event: K, listener: DoneTrackerListener<K>): void;

  add?(child: DoneTracker): void;
  abort(): void;

  log?(): void;
}
