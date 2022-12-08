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
  private _error: any = null;
  private _errorSource: DoneTracker | undefined;
  private _willHaveChildren: boolean | null = null;
  private _willBeSignaledDone: boolean | null = null;
  private _willHaveChildrenOrBeSignaledDone: boolean | null = null;
  // assume empty is done after = 1000

  private _signalDoneToParent?: () => void = () =>
    warn("Not added to parent yet when signaling done", this.id);
  private _signalAbortToParent?: () => void = () =>
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
    log("Created", performance.now(), this.id);
  }

  add = (child: DoneTracker) => {
    if (this._willHaveChildren === false) {
      warn("Ensured not to have children", this.id, "->", child.id);
    }
    if (this._willBeSignaledDone === true) {
      warn("Ensured to be signaled done", this.id, "->", child.id);
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
    child._signalDoneToParent = () => this._calculateDoneness();
    child._signalAbortToParent = () => {
      this.children.delete(child);
      if (!this._willBeSignaledDone) this._calculateDonenessNextMicrotask();
    }
    child._signalErrorToParent = (err, source) =>
      this._signalError(err, source);
    if (child._done) {
      warn("Child was already done when added", child.id);
      this._calculateDonenessNextMicrotask();
    }
  }

  abort = () => {
    log("Signaling aborted", this.id);
    if (this.done) {
      warn("Already done, can't abort", this.id);
      return;
    }
    this._aborted = true;
    this.onAbort?.();
    this._signalAbortToParent?.();
    if (this._willBeSignaledDone) return;
    Array.from(this.children).forEach((child) => !child.done && child.abort());
    this._calculateDonenessNextMicrotask();
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
    if (this.children.size > 0) {
      warn("You cannot signal done on a done tracker with children", this.id);
      return;
    }
    this._calculateDoneness();
  };

  signalError = (err: any) => {
    this._signalError(err, this);
  };

  private _signalError = (err: any, source: DoneTracker) => {
    this._error = err;
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

  ensureWillBeSignaledDone = () => {
    this._willBeSignaledDone = true;
  };

  private _calculateDonenessNextMicrotask() {
    // Double-renders in React run in the same microtask, so next microtask should be enough
    // https://github.dev/facebook/react/blob/645ae2686b157c9f80193e1ada75b7e00ef49acf/packages/react-reconciler/src/ReactFiberHooks.js#L527
    // and https://stackblitz.com/edit/react-gwohwc?file=src%2FApp.js
    queueMicrotask(() => this._calculateDoneness());
  }

  private _calculateDoneness() {
    if (this._done) {
      warn("🧮 Calculating doneness but already done", this.id);
      return;
    }
    if (this._aborted) {
      warn("🧮 Calculating doneness but aborted", this.id);
      return;
    }
    if (this._error) {
      warn("🧮 Calculating doneness but errored", this.id);
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
      warn("🚧 Will have children so not done yet", this.id);
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
