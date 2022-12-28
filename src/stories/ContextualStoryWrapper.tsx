import React, { MutableRefObject, useCallback, useRef, useState } from "react";
import TrackDone from "../components/TrackDone";
import { TrackComponentDoneProps } from "../track-component-done";

export default function ContextualStoryWrapper(
  props: TrackComponentDoneProps<{
    children: any;
    fullscreen?: boolean;
    hideForceRefresh?: boolean;
    disableStrictMode?: boolean;
  }>
) {
  const [status, setStatus] = useState("pending");

  const {
    onDone,
    onAbort,
    onError,
    onPending,
    disableStrictMode,
    hideForceRefresh,
    children,
  } = props;

  const wrapperStyle = {
    ...(props.fullscreen ? { minHeight: "100vh" } : {}),
    minWidth: "100%",
    padding: "16px",
    backgroundColor: {
      pending: "lightgray",
      done: "green",
      error: "red",
      aborted: "orange",
    }[status],
  };

  const forceRefreshRef: MutableRefObject<(() => void) | null> = useRef(null);

  const wrapper = (
    <div style={wrapperStyle}>
      <TrackDone
        doneTrackerName="ContextualStoryWrapperRoot"
        forceRefreshRef={forceRefreshRef}
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
        onPending={useCallback(() => {
          console.log("Story wrapper status", "pending");
          onPending?.();
          setStatus("pending");
        }, [onPending])}
      >
        {children}
      </TrackDone>
      {!hideForceRefresh && (
        <div>
          <button onClick={() => forceRefreshRef.current?.()}>Restart</button>
        </div>
      )}
    </div>
  );

  return disableStrictMode ? (
    wrapper
  ) : (
    <React.StrictMode>{wrapper}</React.StrictMode>
  );
}

export function ContextualStoryHelper(
  props: TrackComponentDoneProps<{
    fullscreen?: boolean;
    hideForceRefresh?: boolean;
    component: any;
    args: any;
  }>
) {
  const Component = props.component;

  if (!Component) return <></>;

  return (
    <ContextualStoryWrapper
      onDone={props.onDone}
      onPending={props.onPending}
      onError={props.onError}
      onAbort={props.onAbort}
      fullscreen={props.fullscreen}
      hideForceRefresh={props.hideForceRefresh}
    >
      <Component {...props.args} />
    </ContextualStoryWrapper>
  );
}
