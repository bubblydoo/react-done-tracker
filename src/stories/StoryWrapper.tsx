/* eslint-disable react/display-name */
import React, {
  ComponentPropsWithRef,
  ComponentType,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  trackComponentDone,
  TrackComponentDoneProps,
} from "../track-component-done";

type StoryWrapperProps<T extends ComponentType> = TrackComponentDoneProps<{
  component: T;
  hideForceRefresh?: boolean;
  strictMode?: boolean;
  imperative?: boolean;
  style?: any
}> &
  Omit<
    ComponentPropsWithRef<T>,
    "component" | "showForceRefresh" | "strictMode" | "imperative"
  >;

export default function StoryWrapper<T extends ComponentType<any>>({
  component,
  hideForceRefresh = false,
  strictMode = true,
  imperative = false,
  onDone,
  onAbort,
  onError,
  onPending,
  style,
  fullscreen,
  ...componentProps
}: StoryWrapperProps<T>) {
  const forceRefreshRef = useRef<(() => void) | null>(null);
  const C = useMemo(
    () =>
      trackComponentDone<T>(component, {
        imperative,
        forceRefreshRef,
        doneTrackerName: "StoryWrapperRoot",
      }),
    [component, imperative]
  );

  const [status, setStatus] = useState("pending");

  const wrapperStyle = {
    ...(fullscreen ? { minHeight: "100vh" } : {}),
    minWidth: "100%",
    padding: "16px",
    backgroundColor: {
      pending: "lightgray",
      done: "green",
      error: "red",
      aborted: "orange",
    }[status],
    ...style
  };

  const wrapper = (
    <div style={wrapperStyle}>
      {!hideForceRefresh && (
        <button onClick={() => forceRefreshRef?.current?.()}>
          Restart
        </button>
      )}
      <div>
        <C
          {...componentProps}
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
