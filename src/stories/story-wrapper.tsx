/* eslint-disable react/display-name */
import React, { useCallback, useMemo, useRef, useState } from "react";
import { trackComponentDone } from "../track-component-done";

type Props = any;

export default function StoryWrapper({
  component,
  showForceRefresh = true,
  strictMode = true,
  imperative = false,
  // willHaveChildren = undefined,
  // willBeSignaledDone = undefined,
  ...props
}: Props) {
  const forceRefreshRef = useRef<(() => void) | null>(null);
  const C = useMemo(
    () => trackComponentDone(component, imperative, forceRefreshRef),
    [component, imperative]
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

  const wrapper = (
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
              console.log("Story wrapper status", "aborted");
              onAbort?.(...args);
              setStatus("aborted");
            },
            [onAbort]
          )}
          onError={useCallback(
            (...args) => {
              console.log("Story wrapper status", "error");
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

  return strictMode ? <React.StrictMode>{wrapper}</React.StrictMode> : wrapper;
}
