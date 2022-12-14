import { BaseDoneTracker } from "./base-done-tracker";
import { DEBUG } from "./debug";
import { DoneTracker } from "./done-tracker-interface";
import { getUniqueId } from "./get-unique-id";
import { log, warn, debug } from "./log";

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
      warn(
        "Parent already done while adding child",
        this.id,
        "while adding",
        child.id
      );
      return;
    }
    if (this.error) {
      warn(
        "Parent already errored while adding child",
        this.id,
        "while adding",
        child.id
      );
      return;
    }
    this.children.add(child);
    log("🍴 Added", this.id, "->", child.id);
    child.addEventListener("done", () => {
      if (this.isFinalState) return;
      this._calculateDoneness();
    });
    child.addEventListener("abort", () => {
      debug("Child of", this.id, "aborted, deleting", child.id);
      this.children.delete(child);
      if (this.isFinalState) return;
      this._calculateDoneness();
    });
    child.addEventListener("error", ([err, source]) => {
      log("❌ Received error", this.id, err, "from", source.id);
      if (this.isFinalState) return;
      this._signalError(err, source);
    });

    if (child.done) {
      debug("Child was already done when added", child.id);
      this._calculateDoneness();
    }
    if (child.error) {
      warn("Child was already errored when added", child.id);
      this._signalError(child.error, child.errorSource!);
    }
  };

  abort = () => {
    if (this.done) {
      warn("Already done, can't abort", this.id);
      return;
    }
    log("🗑 Signaling aborted", this.id);
    this._aborted = true;
    this.dispatchEvent("abort");
    Array.from(this.children).forEach((child) => !child.done && child.abort());
    this._calculateDoneness();
  };

  private _signalError = (err: any, source: DoneTracker) => {
    this._error = err;
    this._errorSource = source;
    this.dispatchEvent("error", err, source);
  };

  calculateDoneness = () => {
    this._calculateDoneness();
  }

  private _calculateDoneness = () => {
    if (this._done) {
      log("🧮 Calculating doneness but already done", this.id);
      return;
    }
    if (this._aborted) {
      log("🧮 Calculating doneness but aborted", this.id);
      return;
    }
    if (this._error) {
      log("🧮 Calculating doneness but errored", this.id);
      return;
    }
    const nDoneChildren = Array.from(this.children).filter(
      (child) => child.done
    ).length;

    if (DEBUG) {
      console.groupCollapsed(
        "[Done Tracker]",
        "🧮 Calculating doneness",
        this.id
      );
      this.log();
      console.groupEnd();
    }
    if (this._done) return;
    if (this.skip) {
      log("🚧 Skipped so not done yet", this.id);
      return;
    }
    const allChildrenDone = nDoneChildren === this.children.size;
    if (!allChildrenDone) return;
    this._done = true;
    this._doneAt = performance.now();
    log("✅ All done", this.id, "in", this._doneAt - this._createdAt, "ms");
    this.dispatchEvent("done");
  }

  log = () => {
    const nDoneChildren = Array.from(this.children)
      .map((child) => child.done)
      .filter(Boolean).length;

    console.group(
      "Done Tracker:",
      this.id,
      this.done ? "done" : "not done",
      `${nDoneChildren}/${this.children.size}`,
      this.skip ? "(skipped)" : "(not skipped)"
    );
    console.groupCollapsed("Inspect");
    console.log(this);
    console.groupEnd();
    for (const child of Array.from(this.children)) {
      child.log?.();
    }
    console.groupEnd();
  }
}
