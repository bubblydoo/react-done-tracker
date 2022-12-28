import React, { useState, useRef } from "react";
import { useLeafDoneTracker } from "../use-leaf-done-tracker";

type Props = JSX.IntrinsicElements["img"];

export default function Image(props: Props) {
  const todo = props.src;

  const [done, setDone] = useState<string | undefined>();
  const [error, setError] = useState<any>();

  useLeafDoneTracker({
    name: "Image",
    done: todo === done,
    error,
    reset: () => {
      setDone(undefined);
      setError(undefined);
    }
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
