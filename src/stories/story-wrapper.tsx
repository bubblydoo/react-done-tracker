/* eslint-disable react/display-name */
import React, { useCallback, useMemo, useRef, useState } from "react";
import { trackComponentDone } from "../track-component-done";

type Props = any;

export default function StoryWrapper({
  component,
  showForceRefresh = true,
  ...props
}: Props) {
  const forceRefreshRef = useRef<(() => void) | null>(null);
  const C = useMemo(
    () => trackComponentDone(component, forceRefreshRef),
    [component]
  );

  const [status, setStatus] = useState("pending");

  const style = {
    minHeight: "100vh",
    minWidth: "100%",
    padding: "16px",
    backgroundColor: {
      pending: "lightgray",
      done: "green",
      error: "red",
      aborted: "orange",
    }[status],
  };

  const { onDone, onAbort, onError, onPending } = props;

  return (
    <div style={style}>
      {showForceRefresh && (
        <button onClick={() => forceRefreshRef?.current?.()}>
          Refresh done tracker
        </button>
      )}
      <div>
        <C
          {...props}
          onDone={useCallback(
            (...args) => {
              console.log("Story wrapper status", "done");
              onDone?.(...args);
              setStatus("done");
            },
            [onDone]
          )}
          onAbort={useCallback(
            (...args) => {
              onAbort?.(...args);
              setStatus("aborted");
            },
            [onAbort]
          )}
          onError={useCallback(
            (...args) => {
              onError?.(...args);
              setStatus("error");
            },
            [onError]
          )}
          onPending={useCallback(
            (...args) => {
              console.log("Story wrapper status", "pending");
              onPending?.(...args);
              setStatus("pending");
            },
            [onPending]
          )}
        />
      </div>
    </div>
  );
}
