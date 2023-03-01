import { Fiber, FiberContext, useFiber } from "its-fine";
import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { DoneTrackerError } from "./done-tracker-error";
import {
  NoFlags,
  Passive,
  PassiveStatic,
  PerformedWork,
  Update,
} from "./fiber-flags";
import { didHooksChange } from "./fiber-utils";
import { alwaysWarn, debug } from "./log";
import { NodeDoneTracker } from "./node-done-tracker";
import { queueMicrotaskOrAsap } from "./queue-microtask-or-asap";
import { useDoneTrackerRaw } from "./use-done-tracker-raw";
import { jest } from "@storybook/jest";
import React from "react";

// FLAGS ARE NOT THE RIGHT WAY TO CHECK IF A COMPONENT STILL HAS TO UPDATE 😭
// see https://github.dev/facebook/react/blob/4f8ffec453c41fcb6e98cb4e003f7319bb1c81b9/packages/react-devtools-shared/src/backend/renderer.js#L1435-L1495
// for the correct way

const areFlagsDone = (flags: number) => {
  return (
    (flags & Update) === NoFlags || (flags & Passive && flags & PerformedWork)
  );
};

// done states: flags subtreeFlags
// 100000000000100000000001 100000000000100000000111
const isFiberDone = (fiber: Fiber) => {
  const { alternate } = fiber;

  // debugger;
  // const isHooksChange = alternate
  //   ? didHooksChange(alternate.memoizedState, fiber.memoizedState)
  //   : false;
  const isHooksDone = alternate ? alternate.memoizedState !== fiber.memoizedState : true;

  // const isPropsChange = alternate ? fiber.memoizedProps !== alternate.memoizedProps : false;

  const isPropsDone = fiber.memoizedProps === fiber.pendingProps;

  // const hasUpdateFlag = fiber.flags & Update;

  const done =
    isHooksDone &&
    isPropsDone &&
    // fiber.flags & PerformedWork &&
    !fiber.lanes;
    // && !fiber.childLanes;

  console.log("TESTTT", {
    done,
    isHooksDone,
    isPropsDone,
    alternate,
    flags: fiber.flags.toString(2),
    lanes: fiber.lanes.toString(2),
    childLanes: fiber.childLanes.toString(2),
  });

  // console.log('state node', fiber?.stateNode)

  return done;
};

const USE_FIBER = true;

const SIGNAL_DONE_IMMEDIATELY_ALWAYS = false;

export const useImperativeDoneTracker = (
  doneTracker: NodeDoneTracker,
  {
    name,
    done,
    error,
  }: {
    name?: string;
    done?: boolean;
    error?: any;
  } = {}
) => {
  if (!doneTracker)
    throw new DoneTrackerError(
      "Falsy doneTracker passed to useImperativeDoneTracker"
    );

  const localDoneTracker = useDoneTrackerRaw(doneTracker, "leaf", name);

  // we cannot use useLayoutEffect here because it might run in the same microtask as the render,
  // which would fail the ImmediatelyDoneWithChildren test

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const fiber = USE_FIBER ? useFiber()! : null;

  if (USE_FIBER && !fiber) {
    alwaysWarn(
      "[Done Tracker] Fibers are enabled, but there's no fiber",
      localDoneTracker.id
    );
  }

  const doneRef = useRef<boolean>(!!done);

  const microtaskScheduledRef = useRef<boolean>(false);

  const checkFiberAndSignalDone = useCallback(() => {
    console.log("TESTTT checking", localDoneTracker.id);
    // if (microtaskScheduledRef.current) return;
    if (fiber && isFiberDone(fiber) && doneRef.current) {
      // queueMicrotask(() => {
        // microtaskScheduledRef.current = false;
        // if (fiber && isFiberDone(fiber) && doneRef.current) {
          localDoneTracker.signalDone();
        // }
      // })
      // microtaskScheduledRef.current = true;
    }
    // else {
    //   debugger;
    // }
  }, [fiber, localDoneTracker]);

  useEffect(() => {
    document.addEventListener("recheck", checkFiberAndSignalDone);
    return () => {
      document.removeEventListener("recheck", checkFiberAndSignalDone);
    };
  }, [checkFiberAndSignalDone]);

  useMemo(() => {
    // const j = jest.spyOn(fiber!, 'alternate', 'set');
    // j.

    if (!fiber) return;
    if (!fiber?.alternate) return;

    const mpDescriptor = Object.getOwnPropertyDescriptor(
      fiber,
      "memoizedProps"
    );
    const lanesDescriptor = Object.getOwnPropertyDescriptor(
      fiber,
      "lanes"
    );
    const childLanesDescriptor = Object.getOwnPropertyDescriptor(
      fiber,
      "childLanes"
    );
    const alternateDescriptor = Object.getOwnPropertyDescriptor(
      fiber,
      "alternate"
    );
    // const ampDescriptor = Object.getOwnPropertyDescriptor(fiber?.alternate, "memoizedProps");
    const ampDescriptor = fiber.alternate
      ? Object.getOwnPropertyDescriptor(fiber.alternate, "memoizedProps")
      : undefined;
    let currAmpDescriptor = ampDescriptor;

    if (!mpDescriptor) return;
    if (!alternateDescriptor) return;
    if (!lanesDescriptor) return;
    if (!childLanesDescriptor) return;
    // if (!ampDescriptor) return;

    function overrideAMP(x: any) {
      currAmpDescriptor = Object.getOwnPropertyDescriptor(x, "memoizedProps");
      Object.defineProperty(x, "memoizedProps", {
        enumerable: currAmpDescriptor!.enumerable,
        configurable: currAmpDescriptor!.configurable,
        // writable: descriptor.writable,
        get: function () {
          console.log("getting fiber.alternate.memoizedProps");
          if (!currAmpDescriptor) return;
          if ("value" in currAmpDescriptor) return currAmpDescriptor.value;
          return currAmpDescriptor.get?.();
        },
        set: function (x) {
          console.log("setting fiber.alternate.memoizedProps", x);
          if (!currAmpDescriptor) return;
          if ("value" in currAmpDescriptor) {
            currAmpDescriptor.value = x;
            // console.log(
            //   "is done",
            //   isFiberDone(fiber!),
            //   fiber?.flags.toString(2),
            //   localDoneTracker.id
            // );
            checkFiberAndSignalDone();
          }
          currAmpDescriptor.set?.(x);
        },
      });
    }

    Object.defineProperty(fiber, "memoizedProps", {
      enumerable: mpDescriptor.enumerable,
      configurable: mpDescriptor.configurable,
      // writable: descriptor.writable,
      get: function () {
        if (!mpDescriptor) return;
        if ("value" in mpDescriptor) return mpDescriptor.value;
        return mpDescriptor.get?.();
      },
      set: function (x) {
        console.log("setting fiber.memoizedProps", x);
        if (!mpDescriptor) return;
        if ("value" in mpDescriptor) {
          mpDescriptor.value = x;
          // console.log(
          //   "is done",
          //   isFiberDone(fiber!),
          //   fiber?.flags.toString(2),
          //   localDoneTracker.id
          // );
          checkFiberAndSignalDone();
        }
        mpDescriptor.set?.(x);
      },
    });

    Object.defineProperty(fiber, "alternate", {
      enumerable: alternateDescriptor.enumerable,
      configurable: alternateDescriptor.configurable,
      get: function () {
        // console.log("getting fiber.alternate");
        if (!alternateDescriptor) return;
        if ("value" in alternateDescriptor) return alternateDescriptor.value;
        return alternateDescriptor.get?.();
      },
      set: function (x) {
        console.log("setting fiber.alternate", x);
        if (!alternateDescriptor) return;
        if ("value" in alternateDescriptor) {
          alternateDescriptor.value = x;
          if (x) {
            overrideAMP(x);
          } else {
            currAmpDescriptor = undefined;
          }
          checkFiberAndSignalDone();
        }
        alternateDescriptor.set?.(x);
      },
    });

    Object.defineProperty(fiber, "lanes", {
      enumerable: lanesDescriptor.enumerable,
      configurable: lanesDescriptor.configurable,
      get: function () {
        // console.log("getting fiber.alternate");
        if (!lanesDescriptor) return;
        if ("value" in lanesDescriptor) return lanesDescriptor.value;
        return lanesDescriptor.get?.();
      },
      set: function (x) {
        console.log("setting fiber.lanes", x);
        if (!lanesDescriptor) return;
        if ("value" in lanesDescriptor) {
          lanesDescriptor.value = x;
        }
        checkFiberAndSignalDone();
        lanesDescriptor.set?.(x);
      },
    });

    Object.defineProperty(fiber, "childLanes", {
      enumerable: childLanesDescriptor.enumerable,
      configurable: childLanesDescriptor.configurable,
      get: function () {
        // console.log("getting fiber.alternate");
        if (!childLanesDescriptor) return;
        if ("value" in childLanesDescriptor) return childLanesDescriptor.value;
        return childLanesDescriptor.get?.();
      },
      set: function (x) {
        console.log("setting fiber.alternate", x);
        if (!childLanesDescriptor) return;
        if ("value" in childLanesDescriptor) {
          childLanesDescriptor.value = x;
        }
        checkFiberAndSignalDone();
        childLanesDescriptor.set?.(x);
      },
    });

    overrideAMP(fiber.alternate);

    return () => {
      if (currAmpDescriptor)
        Object.defineProperty(
          fiber.alternate,
          "memoizedProps",
          currAmpDescriptor
        );
      Object.defineProperty(fiber, "alternate", alternateDescriptor);
      Object.defineProperty(fiber, "memoizedProps", mpDescriptor);
      Object.defineProperty(fiber, "lanes", lanesDescriptor);
      Object.defineProperty(fiber, "childLanes", childLanesDescriptor);
    };
  }, [fiber, fiber?.alternate]);

  // const desc = describeFibers(fiber, fiber)
  // useEffect is used because the leaf might not be added to the parent yet
  useEffect(() => {
    if (error) {
      localDoneTracker.signalError(error);
    } else if (done) {
      doneRef.current = true;
      if (SIGNAL_DONE_IMMEDIATELY_ALWAYS) {
        localDoneTracker.signalDone();
        return;
      }

      // If there's no fiber, we can't keep track of React,
      // but we run after a microtask to be sure (this already fixes the )
      if (!fiber) {
        alwaysWarn("No fiber");
        let ignore = false;
        // doneRef.current = true;
        queueMicrotaskOrAsap(() => {
          if (ignore) return;
          localDoneTracker.signalDone();
        });
        return () => {
          ignore = true;
        };
      }

      // if (isFiberDone(fiber)) {
      //   alwaysWarn(
      //     "this fiber is done but we're inside a useEffect callback and that's impossible",
      //     localDoneTracker.id
      //   );
      // }

      // console.log('adding event listener')

      // console.log(
      //   localDoneTracker.id,
      //   "fiber flags 1",
      //   fiber.flags.toString(2)
      // );

      // schedule after all effects have run:
      // queueMicrotask so we know it's run when no more effects are running
      // (because effects are run one after another immediately,
      // by the end of the microtask they should be done)
      // (also running isFiberDone(fiber) immediately would always return false)
      let ignore = false;
      // queueMicrotaskOrAsap(() => {
      //   queueMicrotaskOrAsap(() => {
      //     queueMicrotaskOrAsap(() => {
      //       if (ignore) return;
      //       checkFiberAndSignalDone();
      //       // if (isFiberDone(fiber) && doneRef.current) {
      //       //   localDoneTracker.signalDone();
      //       // }
      //     });
      //   });
      // });

      // const timeoutId = setTimeout(() => {
      //   console.log("TIMEOUT RUNNING")
      //   if (isFiberDone(fiber) && doneRef.current) {
      //     localDoneTracker.signalDone();
      //   }
      // }, 10000);
      return () => {
        // clearTimeout(timeoutId);
        ignore = true;
      };
    } else {
      doneRef.current = false;
      // if pending and already done, reset
      if (localDoneTracker.done || localDoneTracker.errored) {
        debug(
          "Resetting because error and done both falsy",
          localDoneTracker.id
        );
        localDoneTracker.reset();
      }
    }
  }, [done, error, localDoneTracker, fiber, checkFiberAndSignalDone]);

  // useEffect(() => {
  //   queueMicrotaskOrAsap(() => {
  //     if (fiber && isFiberDone(fiber) && doneRef.current) {
  //       localDoneTracker.signalDone();
  //     }
  //   });
  // })

  return localDoneTracker;
};
