import React, { useState, useRef } from "react";
import { DoneTrackedProps } from "../done-tracked";
import { useLeafDoneTracker } from "../use-leaf-done-tracker";
import { equal } from "../util/equal";

type Props = DoneTrackedProps<JSX.IntrinsicElements["img"]>;

export default function Image({
  doneTracker: parentDoneTracker,
  ...props
}: Props) {
  const [doneTracker] = useLeafDoneTracker(parentDoneTracker, {
    name: "Image",
    isDone: () => equal(todo, done),
  });

  const todo = props.src;

  const [done, setDone] = useState<any>();

  // we need to keep track of this, because img.complete is true even when errored
  const erroredSrc = useRef<string | undefined>();

  const ref = useRef<HTMLImageElement>();

  return (
    <img
      {...props}
      ref={(r) => {
        if (!r) return;
        ref.current = r;
        if (r.complete && erroredSrc.current !== r.src) setDone(r.src);
      }}
      onLoad={() => {
        erroredSrc.current = undefined;
        setDone(ref.current?.src);
      }}
      onError={(err) => {
        console.error(err);
        erroredSrc.current = props.src;
        doneTracker.signalError(err);
      }}
    />
  );
}
