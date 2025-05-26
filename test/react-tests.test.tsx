import React, { useEffect, useState, use, act } from "react";
import { expect, test, describe, suite } from "vitest";
import { render as origRender } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import {
  useDoneTracker,
  DoneTrackedSuspense,
  DoneTrackerProvider,
  NodeDoneTracker,
  useNodeDoneTracker,
} from "../src";

suite("React Tests", () => {
  describe.each([true, false])("strict mode %s", (reactStrictMode) => {
    const render = (...args: Parameters<typeof origRender>) => {
      args[1] ??= {};
      args[1].reactStrictMode = reactStrictMode;
      return origRender(...args);
    };

    test("it is immediately done", () => {
      function ImmediatelyDone() {
        useDoneTracker({
          name: "Immediately Done",
          done: true,
        });

        return <div>done</div>;
      }

      const doneTracker = new NodeDoneTracker();

      render(
        <DoneTrackerProvider doneTracker={doneTracker}>
          <ImmediatelyDone />
        </DoneTrackerProvider>
      );

      expect(doneTracker.done).toBe(true);
    });

    test("is done after 1 effect", () => {
      function DoneAfter1Effect() {
        const [done, setDone] = useState(false);

        useEffect(() => {
          setDone(true);
        }, []);

        useDoneTracker({
          name: "Done After 1 Effect",
          done,
        });

        return <div>done</div>;
      }

      const doneTracker = new NodeDoneTracker();

      render(
        <DoneTrackerProvider doneTracker={doneTracker}>
          <DoneAfter1Effect />
        </DoneTrackerProvider>
      );

      expect(doneTracker.done).toBe(true);
    });

    test("it errors immediately", () => {
      const error = new Error("error");

      function ImmediatelyErroring() {
        useDoneTracker({
          name: "Immediately Erroring",
          error,
        });

        return <div>oops</div>;
      }

      const doneTracker = new NodeDoneTracker();

      render(
        <DoneTrackerProvider doneTracker={doneTracker}>
          <ImmediatelyErroring />
        </DoneTrackerProvider>
      );

      expect(doneTracker.error).toBe(error);
    });

    test("just pending", () => {
      function JustPending() {
        useDoneTracker({
          name: "Just Pending",
          done: false,
        });

        return <div>pending</div>;
      }

      const doneTracker = new NodeDoneTracker();

      render(
        <DoneTrackerProvider doneTracker={doneTracker}>
          <JustPending />
        </DoneTrackerProvider>
      );

      expect(doneTracker.done).toBe(false);
      expect(doneTracker.error).toBeFalsy();
    });

    test("is pending and then done", async () => {
      let testSetDone: (v: boolean) => void;

      function PendingThenDone() {
        const [done, setDone] = useState(false);

        useDoneTracker({
          name: "Pending Then Done",
          done,
        });

        testSetDone = setDone;

        return <div>done: {done ? "yes" : "no"}</div>;
      }

      const doneTracker = new NodeDoneTracker();

      render(
        <DoneTrackerProvider doneTracker={doneTracker}>
          <PendingThenDone />
        </DoneTrackerProvider>
      );

      expect(doneTracker.done).toBe(false);

      await act(async () => {
        testSetDone(true);
      });

      expect(doneTracker.done).toBe(true);

      await act(async () => {
        testSetDone(false);
      });

      expect(doneTracker.done).toBe(false);
    });

    test("done tracked suspense", async () => {
      const doneTracker = new NodeDoneTracker();

      function Test({ promise }: { promise: Promise<void> }) {
        return (
          <DoneTrackerProvider doneTracker={doneTracker}>
            <DoneTrackedSuspense fallback={<div>Loading...</div>}>
              <PromiseUse promise={promise} />
            </DoneTrackedSuspense>
          </DoneTrackerProvider>
        );
      }

      const pwr1 = promiseWithResolvers<void>();

      function PromiseUse({ promise }: { promise: Promise<void> }) {
        use(promise);

        return <div>Promise resolved</div>;
      }

      await act(async () => {
        render(<Test promise={pwr1.promise} />);
      });

      expect(doneTracker.done).toBe(false);

      await act(async () => {
        pwr1.resolve();
      });

      expect(doneTracker.done).toBe(true);

      await act(async () => {
        render(<Test promise={pwr1.promise} />);
      });

      expect(doneTracker.done).toBe(true);

      const pwr2 = promiseWithResolvers<void>();

      await act(async () => {
        render(<Test promise={pwr2.promise} />);
      });

      expect(doneTracker.done).toBe(false);

      await act(async () => {
        pwr2.resolve();
      });

      expect(doneTracker.done).toBe(true);
    });

    test("immediately done with children", async () => {
      const Done = () => {
        useDoneTracker({
          name: "Done",
          done: true,
        });
        return <div>Done</div>;
      };
      const NotDone = () => {
        useDoneTracker({
          name: "Not Done",
          done: false,
        });
        return <div>Not Done</div>;
      };

      const Tree = () => {
        const parent = useNodeDoneTracker({ name: "Parent" });

        return (
          <DoneTrackerProvider doneTracker={parent}>
            <Done />
            <NotDone />
          </DoneTrackerProvider>
        );
      };

      const doneTracker = new NodeDoneTracker();

      await act(async () => {
        render(
          <DoneTrackerProvider doneTracker={doneTracker}>
            <Tree />
          </DoneTrackerProvider>
        );
      });

      expect(doneTracker.done).toBe(false);
    });

    test("meta test that effects are called twice in strict mode", async () => {
      let effectCount = 0;

      function DoubleEffect() {
        useEffect(() => {
          effectCount++;
        }, []);

        return <div>Double Effect</div>;
      }

      render(<DoubleEffect />);

      expect(effectCount).toBe(reactStrictMode ? 2 : 1);
    });
  });
});

/** Polyfill for Promise.withResolvers() */
function promiseWithResolvers<T>() {
  let resolve: (value: T) => void;
  let reject: (reason?: any) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve: resolve!, reject: reject! };
}
