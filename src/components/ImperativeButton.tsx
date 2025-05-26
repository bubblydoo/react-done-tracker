import React, { useEffect, useState } from "react";
import { ImperativeDoneTrackedProps } from "../imperative-done-tracked";
import { useImperativeDoneTracker } from "../use-imperative-done-tracker";

type Props = ImperativeDoneTrackedProps<React.JSX.IntrinsicElements["button"]> & {
  persistDone?: boolean;
};

export default function Button({
  doneTracker: parentDoneTracker,
  persistDone,
  children,
  ...props
}: Props) {
  const [done, setDone] = useState(false);

  const dt = useImperativeDoneTracker(parentDoneTracker, {
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
