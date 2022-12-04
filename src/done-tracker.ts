const DEBUG = true;

const global = typeof window !== "undefined" ? (window as any) : {};
global._done_tracker_id = 0;

const log = (...args: any[]) => console.log("[Done Tracker]", ...args);

const warn = (...args: any[]) => console.warn("[Done Tracker]", ...args);

/**
 * Keeps track of "doneness" of a component tree
 * A DoneTracker is done when all of its children are done
 */
export class DoneTracker {
  private readonly children = new Set<DoneTracker>();
  private readonly _id = global._done_tracker_id++;
  private _name: string | undefined;
  /** All children done (except when ensured children and children.size === 0) */
  private _done = false;
  private _aborted = false;
  private _errored: any = null;
  private _errorSource: DoneTracker | undefined;
  private _willHaveChildren: boolean | null = null;

  private _signalDoneToParent?: () => void = () =>
    warn("Not added to parent yet when signaling done", this.id);
  private _signalCancelToParent?: () => void = () =>
    warn("Not added to parent yet when signaling cancel", this.id);
  private _signalErrorToParent?: (err: any, source: DoneTracker) => void = () =>
    warn("Not added to parent yet when signaling error", this.id);

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
    return !!this._errored;
  }

  get error() {
    return this._errored;
  }

  constructor(
    private onDone?: () => any,
    private onAbort?: () => any,
    private onError?: (err: any, source?: DoneTracker) => any,
    name?: string
  ) {
    if (name) this._name = name;
    log("Created", performance.now(), this.id);
  }

  add(child: DoneTracker) {
    if (this._willHaveChildren === false) {
      console.warn("Ensured not to have children", this.id, "->", child.id);
    }
    if (this.done) {
      warn(
        "Parent already done while adding child",
        this.id,
        "while adding",
        child.id
      );
      return;
    }
    this.children.add(child);
    log("🍴 Added", this.id, "->", child.id);
    child._signalDoneToParent = () => this.calculateDoneness();
    child._signalCancelToParent = () => this.children.delete(child);
    child._signalErrorToParent = (err, source) =>
      this._signalError(err, source);
    if (child._done) {
      warn("Child was already done when added", child.id);
      this.calculateDoneness();
    }
  }

  // forkChild = (
  //   onChildDone?: () => any,
  //   onChildAbort?: () => any,
  //   onChildError?: (err: any, source?: DoneTracker) => any,
  //   name?: string
  // ) => {
  //   log("Forking", this.id);
  //   const child = new DoneTracker(
  //     () => {
  //       onChildDone?.();
  //       this.childrenDone.set(child, true);
  //       this.calculateDoneness();
  //     },
  //     () => {
  //       onChildAbort?.();
  //       log("Received abort", this.id, "from child", child.id);
  //       this.childrenDone.delete(child);
  //     },
  //     (err, source = this) => {
  //       this._error = err;
  //       this._errorSource = source;
  //       this._signalError(err, source);
  //       onChildError?.(err, source);
  //     },
  //     name
  //   );
  //   if (this.allChildrenDone) {
  //     warn("Parent already done while forking", this.id, "->", child.id);
  //   }
  //   log("🍴 Forked", this.id, "->", child.id);
  //   this.childrenDone.set(child, false);
  //   return child;
  // };

  abort = () => {
    log("Signaling aborted", this.id);
    if (this.done) {
      warn("Already done, can't abort", this.id);
      return;
    }
    this._aborted = true;
    this.onAbort?.();
    this._signalCancelToParent?.();
    Array.from(this.children).forEach((child) => !child.done && child.abort());
  };

  /**
   * This function exists because of React strict mode.
   * The done tracker might already have been aborted during the first render.
   */
  setup = () => {
    log("Setting up before adding", this.id);
    this._aborted = false;
  };

  signalDone = () => {
    log("Signaling done", this.id);
    if (this.aborted) {
      warn("Already aborted, can't signal done", this.id);
      return;
    }
    if (this.done) {
      warn("Already done, can't signal done", this.id);
      return;
    }
    this.calculateDoneness();
  };

  signalError = (err: any) => {
    this._signalError(err, this);
  };

  private _signalError = (err: any, source: DoneTracker) => {
    this._errored = err;
    this._errorSource = source;
    this.onError?.(err, source);
    this._signalErrorToParent?.(err, source);
  };

  ensureWillHaveChildren = () => {
    this._willHaveChildren = true;
  };

  ensureWillHaveNoChildren = () => {
    this._willHaveChildren = false;
  };

  private calculateDoneness() {
    if (this._done) {
      warn("🧮 Calculating doneness but already done", this.id);
      return;
    }
    const nDoneChildren = Array.from(this.children).filter(
      (child) => child.done
    ).length;

    console.groupCollapsed(
      "[Done Tracker]",
      "🧮 Calculating doneness",
      this.id
    );
    this.log();
    console.groupEnd();
    if (this._done) return;
    if (this._willHaveChildren && this.children.size === 0) {
      warn("🚧 Will have children so not done yet");
      return;
    }
    const allChildrenDone = nDoneChildren === this.children.size;
    if (!allChildrenDone) return;
    this._done = true;
    this._doneAt = performance.now();
    // this._doneAt = performance.now();
    // this._doneMethod = 'children';
    log("✅ All done", this.id, "in", this._doneAt - this._createdAt, "ms");
    this.onDone?.();
    this._signalDoneToParent?.();
  }

  log() {
    const nDoneChildren = Array.from(this.children)
      .map((child) => child.done)
      .filter(Boolean).length;

    console.group(
      "Done Tracker:",
      this.id,
      this.done ? "done" : "not done",
      `${nDoneChildren}/${this.children.size}`,
      this._willHaveChildren ? "(ensured children)" : "(not ensured children)"
    );
    console.groupCollapsed("Inspect");
    console.log(this);
    console.groupEnd();
    for (const child of Array.from(this.children)) {
      // debugger;
      child.log();
    }
    console.groupEnd();
  }
}
