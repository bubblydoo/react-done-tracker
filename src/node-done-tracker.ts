import { BaseDoneTracker } from "./base-done-tracker";
import { DEBUG } from "./debug";
import { DoneTracker } from "./done-tracker-interface";
import { getUniqueId } from "./get-unique-id";
import { log, warn, debug, LOG_PREFIX } from "./log";

/**
 * Keeps track of "doneness" of a component tree
 * A DoneTracker is done when all of its children are done
 */
export class NodeDoneTracker extends BaseDoneTracker implements DoneTracker {
  private readonly children = new Set<DoneTracker>();
  private readonly _id = getUniqueId();
  private _name: string | undefined;
  /** All children done (except when ensured children and children.size === 0) */
  private _done = false;
  private _aborted = false;
  private _error: any = null;
  private _errorSource: DoneTracker | undefined;
  public skip = false;

  private readonly _createdAt = performance.now();
  private _doneAt: number | null = null;
  private _erroredAt: number | null = null;
  private _pendingAt: number = performance.now();

  get id() {
    return this._name ? `${this._id}:${this._name}` : this._id;
  }

  get done() {
    return this._done;
  }

  get name(): string | undefined {
    return this._name;
  }

  set name(v: string | undefined) {
    this._name = v;
  }

  get aborted() {
    return this._aborted;
  }

  get errored() {
    return !!this._error;
  }

  get error() {
    return this._error;
  }

  get errorSource() {
    return this._errorSource;
  }

  get createdAt() {
    return this._createdAt;
  }

  get doneAt() {
    return this._doneAt;
  }

  get erroredAt() {
    return this._erroredAt;
  }

  get pendingAt() {
    return this._pendingAt;
  }

  private get isFinalState() {
    return this.error || this.done || this.aborted;
  }

  constructor(name?: string) {
    super();
    if (name) this._name = name;
    log("🍼 Created", performance.now(), this.id);
  }

  add = (child: DoneTracker) => {
    if (this.done) {
      log(
        "Parent already done while adding child",
        this.id,
        "while adding",
        child.id,
        "resetting parent"
      );
      this.reset();
    }
    if (this.errored) {
      log(
        "Parent already errored while adding child",
        this.id,
        "while adding",
        child.id,
        "resetting parent",
        this,
        child
      );
      this.reset();
    }
    this.children.add(child);
    log("🍴 Added", this.id, "->", child.id);
    child.addEventListener("done", () => {
      if (this.isFinalState) return;
      debug("Received done", this.id, "from", child.id);
      this.checkAndDispatchState();
    });
    child.addEventListener("abort", () => {
      debug("Child of", this.id, "aborted, deleting", child.id);
      this.children.delete(child);
      if (this.isFinalState) return;
      this.checkAndDispatchState();
    });
    child.addEventListener("error", ([err, source]) => {
      log("❌ Received error", this.id, err, "from", source.id);
      if (this.isFinalState) return;
      this.checkAndDispatchState();
    });
    child.addEventListener("reset", () => {
      debug("Child of", this.id, "resetted");
      const canReset = this.done || this.error;
      if (!canReset) return;
      this.reset();
    });
    if (child.done) {
      debug("Child was already done when added", child.id);
      this.checkAndDispatchState();
    }
    if (child.error) {
      debug("Child was already errored when added", child.id);
      this.checkAndDispatchState();
    }
  };

  abort = () => {
    if (this.done) {
      warn("Already done, can't abort", this.id);
      return;
    }
    log(
      "🗑 Aborted",
      this.id,
      "after",
      performance.now() - this._createdAt,
      "ms"
    );
    this._aborted = true;
    this.dispatchEvent("abort");
    Array.from(this.children).forEach((child) => !child.done && child.abort());
    this.checkAndDispatchState();
  };

  reset = () => {
    if (this.aborted) {
      warn("Already aborted, can't reset", this.id);
      return;
    }
    this._pendingAt = performance.now();
    log(
      "🔄 Reset",
      this.id,
      "after",
      this._pendingAt - (this._doneAt || this._erroredAt || this._createdAt),
      "ms"
    );
    this._done = false;
    this._error = null;
    this._errorSource = undefined;
    this.dispatchEvent("reset");
  };

  /**
   * We go through the children and check if they are done or errored.
   * If so, we save this state locally.
   * Then we dispatch that state to the parent done tracker,
   * which will in turn also check and dispatch their state.
   */
  checkAndDispatchState = () => {
    if (this.skip) {
      log("🚧 Not checking state because skipped", this.id);
      return;
    }
    if (this._done) {
      log("🧮 Not checking state because already done", this.id);
      return;
    }
    if (this._error) {
      log("🧮 Not checking state because already errored", this.id);
      return;
    }
    if (this._aborted) {
      log("🧮 Not checking state because aborted", this.id);
      return;
    }

    if (DEBUG === "vvv" || DEBUG === "vv") {
      console.groupCollapsed(LOG_PREFIX, "🧮 Calculating doneness", this.id);
      this.log(DEBUG);
      console.groupEnd();
    } else {
      log("🧮 Calculating doneness", this.id);
    }

    const children = Array.from(this.children);

    const erroredChild = children.find((child) => child.errored);

    if (erroredChild) {
      this._error = erroredChild.error;
      this._errorSource = erroredChild.errorSource;
      this._erroredAt = performance.now();
      log(
        "❌ Errored",
        this.id,
        "after",
        this._erroredAt - this._pendingAt,
        "ms"
      );
      this.dispatchEvent("error", this.error, this.errorSource!);
      return;
    }

    const nDoneChildren = children.filter((child) => child.done).length;
    const allChildrenDone = nDoneChildren === this.children.size;
    if (!allChildrenDone) return;
    this._done = true;
    this._doneAt = performance.now();
    log("✅ All done", this.id, "after", this._doneAt - this._pendingAt, "ms");
    this.dispatchEvent("done");
  };

  log = (level: "vvv" | "vv" | "v" = "v") => {
    const nDoneChildren = Array.from(this.children)
      .map((child) => child.done)
      .filter(Boolean).length;

    const mainLog = [
      "Done Tracker:",
      this.id,
      this.done ? "done" : "not done",
      `${nDoneChildren}/${this.children.size}`,
      this.skip ? "(skipped)" : "(not skipped)"
    ]

    if (level === "v") {
      console.log(...mainLog);
      return;
    }

    console.group(...mainLog);

    console.groupCollapsed("Inspect");
    console.log(this);
    console.groupEnd();

    if (level === "vvv") {
      const children = Array.from(this.children).sort(
        (a, b) => a.createdAt - b.createdAt
      );
      for (const child of children) {
        child.log?.();
      }
    }

    console.groupEnd();
  };
}
