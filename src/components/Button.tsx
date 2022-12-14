import React, { useState } from "react";
import { useLeafDoneTracker } from "../use-leaf-done-tracker";

type Props = JSX.IntrinsicElements["button"] & {
  persistDone?: boolean;
};

export default function Button({
  persistDone,
  children,
  ...props
}: Props) {
  const [done, setDone] = useState(false);

  useLeafDoneTracker({
    name: "Button",
    done,
    reset: () => {
      if (!persistDone) setDone(false);
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
