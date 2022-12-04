import React, { useState, useEffect, useRef } from "react";
import { DoneTrackedProps } from "../done-tracked";
import { useDoneTracker } from "../done-tracker-hook";
import { equal } from "../util/equal";

type Props = DoneTrackedProps<JSX.IntrinsicElements["img"]>;

export default function Image({ doneTracker, ...props }: Props) {
  const localDoneTracker = useDoneTracker(doneTracker, "Image");

  const todo = props.src;

  const [done, setDone] = useState<any>();

  // we need to keep track of this, because img.complete is true even when errored
  const erroredSrc = useRef<string | undefined>();

  useEffect(() => {
    console.log('image done?', todo, done);
    if (equal(todo, done)) localDoneTracker.signalDone();
  }, [localDoneTracker, todo, done]);

  const ref = useRef<HTMLImageElement>();

  return (
    <>
    {localDoneTracker.id}:{localDoneTracker.done ? "done" : "not done"}
    <img
    style={{ display: 'block'}}
      {...props}
      ref={(r) => {
        if (!r) return;
        ref.current = r;
        if (r.complete && erroredSrc.current !== r.src) setDone(r.src);
      }}
      onLoad={() => {
        erroredSrc.current = undefined;
        setDone(ref.current?.src)
      }}
      onError={(err) => {
        console.error(err);
        erroredSrc.current = props.src;
        localDoneTracker.signalError(err);
      }}
    />
    </>
  );
}
