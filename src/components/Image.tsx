import React, { useState, useRef } from "react";
import { DoneTrackedProps } from "../done-tracked";
import { useLeafDoneTracker } from "../use-leaf-done-tracker";

type Props = DoneTrackedProps<JSX.IntrinsicElements["img"]>;

export default function Image({
  doneTracker: parentDoneTracker,
  ...props
}: Props) {
  const todo = props.src;

  const [done, setDone] = useState<string>();
  const [error, setError] = useState<any>();

  useLeafDoneTracker(parentDoneTracker, {
    name: "Image",
    done: todo === done,
    error
  });

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
        setError(err);
      }}
    />
  );
}
