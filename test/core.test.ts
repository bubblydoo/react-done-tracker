import { expect, suite, test } from "vitest";
import { LeafDoneTracker, NodeDoneTracker } from "../src";

suite("Core Tests", () => {
  test("basic example", () => {
    const parent = new NodeDoneTracker("Test");

    let done = false;
    parent.addEventListener("done", () => {
      done = true;
    });

    const child = new LeafDoneTracker("Child");
    parent.add(child);
    child.signalDone();

    expect(done).toBe(true);
    expect(parent.done).toBe(true);
    expect(child.done).toBe(true);
  });

  test("skipping", () => {
    const parent = new NodeDoneTracker("Test");
    parent.skip = true;
    const child = new LeafDoneTracker("Child");
    parent.add(child);
    child.signalDone();
    expect(parent.done).toBe(false);
    parent.skip = false;
    parent.checkAndDispatchState();
    expect(parent.done).toBe(true);
  });
});
