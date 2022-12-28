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
  disableStrictMode?: boolean;
  imperative?: boolean;
}> &
  Omit<
    ComponentPropsWithRef<T>,
    "component" | "showForceRefresh" | "strictMode" | "imperative"
  >;

export default function StoryWrapper<T extends ComponentType<any>>({
  component,
  hideForceRefresh = false,
  disableStrictMode = false,
  imperative = false,
  onDone,
  onAbort,
  onError,
  onPending,
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

  const backgroundColor = {
    pending: "lightgray",
    done: "green",
    error: "red",
    aborted: "orange",
  }[status]!;

  const body = document.querySelector<HTMLElement>(".sb-show-main");
  if (body) body.style.backgroundColor = backgroundColor;

  const wrapper = (
    <div style={{ padding: 16, backgroundColor }}>
      {!hideForceRefresh && (
        <div>
          <button onClick={() => forceRefreshRef?.current?.()}>
            🔄 Restart
          </button>
        </div>
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

  return disableStrictMode ? (
    wrapper
  ) : (
    <React.StrictMode>{wrapper}</React.StrictMode>
  );
}
