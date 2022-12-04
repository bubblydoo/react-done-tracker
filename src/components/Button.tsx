import React from "react";
import { DoneTrackedProps } from "../done-tracked";
import { useDoneTracker } from "../done-tracker-hook";

type Props = DoneTrackedProps<JSX.IntrinsicElements["button"]>;

export default function Button({ doneTracker, children, ...props }: Props) {
  const localDoneTracker = useDoneTracker(doneTracker, "Button");

  return (
    <button
      {...props}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        localDoneTracker.signalDone();
      }}
    >
      {children}
    </button>
  );
}
