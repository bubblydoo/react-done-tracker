import React, { useEffect, useState } from "react";
import { ImperativeDoneTrackedProps } from "../imperative-done-tracked";
import { useImperativeLeafDoneTracker } from "../use-imperative-leaf-done-tracker";

type Props = ImperativeDoneTrackedProps<JSX.IntrinsicElements["button"]> & {
  persistDone?: boolean;
};

export default function Button({
  doneTracker: parentDoneTracker,
  persistDone,
  children,
  ...props
}: Props) {
  const [done, setDone] = useState(false);

  const dt = useImperativeLeafDoneTracker(parentDoneTracker, {
    name: "Button",
    done,
  });

  useEffect(() => {
    if (!persistDone) setDone(false);
  }, [dt, persistDone]);

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
