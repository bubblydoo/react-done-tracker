import { BaseDoneTracker } from "./base-done-tracker";
import { DoneTracker } from "./done-tracker-interface";
import { getUniqueId } from "./get-unique-id";
import { log, warn, debug } from "./log";

export class LeafDoneTracker extends BaseDoneTracker implements DoneTracker {
  private readonly _id = getUniqueId();
  private _name: string | undefined;
  private _done = false;
  private _aborted = false;
  private _error: any = null;
  private _errorSource: DoneTracker | undefined;

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

  constructor(name?: string) {
    super();
    if (name) this._name = name;
    log("🍼 Created", performance.now(), this.id);
  }

  abort = () => {
    if (this.done) {
      warn("Already done, can't abort", this.id);
      return;
    }
    log("🗑 Signaling aborted", this.id);
    this._aborted = true;
    this.dispatchEvent("abort");
  };

  signalDone = () => {
    if (this.aborted) {
      warn("Already aborted, can't signal done", this.id);
      return;
    }
    if (this.done) {
      debug("Already done, not signaling done", this.id);
      return;
    }
    if (this.errored) {
      warn("Already errored, can't signal done", this.id);
      return;
    }
    log("✅ Signaling done", this.id);
    this._done = true;
    this._doneAt = performance.now();
    this.dispatchEvent("done");
  };

  signalError = (err: any) => {
    if (this.aborted) {
      warn("Already aborted, can't signal error", this.id);
      return;
    }
    if (this.done) {
      warn("Already done, can't signal error", this.id);
      return;
    }
    if (this.errored) {
      debug("Already errored, not signaling error", this.id);
      return;
    }
    log("❌ Signaling errored", this.id);
    this._error = err;
    this._errorSource = this;
    this.dispatchEvent("error", err, this);
  };

  log = () => {
    console.group("Done Tracker:", this.id, this.done ? "done" : "not done");
    console.groupCollapsed("Inspect");
    console.log(this);
    console.groupEnd();
    console.groupEnd();
  }
}
