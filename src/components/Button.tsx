import React, { useCallback, useRef } from "react";
import { DoneTrackedProps } from "../done-tracked";
import { useLeafDoneTracker } from "../use-leaf-done-tracker";

type Props = DoneTrackedProps<JSX.IntrinsicElements["button"]> & {
  persistDone?: boolean;
};

export default function Button({
  doneTracker: parentDoneTracker,
  persistDone,
  children,
  ...props
}: Props) {
  const done = useRef(false);

  const [, { check }] = useLeafDoneTracker(parentDoneTracker, {
    name: "Button",
    resetDone: useCallback(() => {
      if (!persistDone) done.current = false;
    }, [persistDone]),
    isDone: useCallback(() => done.current, []),
  });

  return (
    <button
      {...props}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        done.current = true;
        check();
      }}
    >
      {children}
    </button>
  );
}
