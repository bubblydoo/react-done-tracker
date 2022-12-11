import React, { useEffect, useState } from "react";
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
  const [done, setDone] = useState(false);

  useLeafDoneTracker(parentDoneTracker, {
    name: "Button",
    done,
    reset: () => {
      if (!persistDone)  setDone(false);
    },
  });

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
