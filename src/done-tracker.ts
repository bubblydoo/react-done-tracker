const DEBUG = true;

const global = (typeof window !== "undefined" ? (window as any) : {});
global._done_tracker_id = 0;

/**
 * Keeps track of "doneness" of a component tree
 * A DoneTracker is done when all of its children are done
 */
export class DoneTracker {
  private readonly childrenDone = new Map<DoneTracker, boolean>();
  private allChildrenDone = false;
  private readonly _id = global._done_tracker_id++;
  private _name: string | undefined;
  private _aborted = false;
  private _error: any = null;
  private _errorSource: DoneTracker | undefined;
  private _willHaveChildren = false;

  get id() {
    return this._name ? `${this._id}:${this._name}` : this._id;
  }

  get done() {
    return this.allChildrenDone;
  }

  get forked() {
    return this.childrenDone.size > 0;
  }

  get name(): string | undefined {
    return this._name;
  }

  set name(v: string | undefined) {
    if (DEBUG) console.log(this._id, "->", v);
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

  constructor(
    private onDone?: () => any,
    private onAbort?: () => any,
    private onError?: (err: any, source?: DoneTracker) => any,
    name?: string
  ) {
    if (name) this._name = name;
    if (DEBUG) console.log("Created", performance.now(), this.id);
  }

  forkChild = (
    onChildDone?: () => any,
    onChildAbort?: () => any,
    onChildError?: (err: any, source?: DoneTracker) => any,
    name?: string
  ) => {
    if (DEBUG) console.log("Forking", this.id);
    if (this.allChildrenDone) {
      if (DEBUG) console.error(`DoneTracker ${this.id} already done`);
      return new DoneTracker();
    }
    const child = new DoneTracker(
      () => {
        onChildDone?.();
        this.childrenDone.set(child, true);
        this.calculateDoneness();
      },
      () => {
        onChildAbort?.();
        this.childrenDone.delete(child);
      },
      (err, source = this) => {
        this._error = err;
        this._errorSource = source;
        this._signalError(err, source);
        onChildError?.(err, source);
      },
      name
    );
    if (DEBUG) console.log("Forked", this.id, "to", this);
    this.childrenDone.set(child, false);
    return child;
  };

  abort = () => {
    if (DEBUG) console.log("Signaling aborted", this.id);
    if (this.done) {
      if (DEBUG) console.warn("Already done, can't abort", this.id);
      return;
    }
    this._aborted = true;
    this.onAbort?.();
    Array.from(this.childrenDone.keys()).forEach(
      (child) => !child.done && child.abort()
    );
  };

  signalDone = () => {
    if (DEBUG) console.log("Signaling done", this.id);
    if (this.done) {
      if (DEBUG) console.warn("Already done, can't signal done", this.id);
      return;
    }
    this.calculateDoneness();
  };

  signalError = (err: any) => {
    this._error = err;
    this._errorSource = this;
    this.onError?.(err, this);
  };

  private _signalError = (err: any, source: DoneTracker) => {
    this._error = err;
    this._errorSource = source;
    this.onError?.(err, source);
  };

  ensureWillHaveChildren = () => {
    this._willHaveChildren = true;
  };

  private calculateDoneness() {
    if (DEBUG)
      console.log(
        "Calculating doneness",
        this.id,
        `${Array.from(this.childrenDone.values()).filter(Boolean).length}/${
          this.childrenDone.size
        }`
      );
    if (this.allChildrenDone) return;
    if (this._willHaveChildren && this.childrenDone.size === 0) {
      if (DEBUG) console.warn("Will have children so not done yet");
      return;
    }
    const hasFalse = Array.from(this.childrenDone.values()).some(
      (x) => x === false
    );
    if (hasFalse) return;
    if (DEBUG) console.log("All done", performance.now(), this.id);
    this.allChildrenDone = true;
    this.onDone?.();
  }
}
