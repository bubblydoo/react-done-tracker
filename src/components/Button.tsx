import React, { useEffect, useState } from "react";
import { DoneTrackedProps } from "../done-tracked";
import { useDoneTracker } from "../done-tracker-hook";

type Props = DoneTrackedProps<JSX.IntrinsicElements["button"]>;

export default function Button({ doneTracker, children, ...props }: Props) {
  const localDoneTracker = useDoneTracker(doneTracker, "Button");

  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) localDoneTracker.signalDone();
  }, [localDoneTracker, done])

  return (
    <button
      {...props}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDone(true);
      }}
    >
      {children}
    </button>
  );
}
