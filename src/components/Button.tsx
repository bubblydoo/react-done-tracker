import React, { useEffect, useState } from "react";
import { useDoneTracker } from "../use-done-tracker";

type Props = JSX.IntrinsicElements["button"] & {
  persistDone?: boolean;
};

export default function Button({
  persistDone,
  children,
  ...props
}: Props) {
  const [done, setDone] = useState(false);

  const dt = useDoneTracker({
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
