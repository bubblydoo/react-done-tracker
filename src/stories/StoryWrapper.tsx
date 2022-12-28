import { Decorator } from "@storybook/react";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ImperativeTrackDone } from "../components/ImperativeTrackDone";
import { TrackDone as ContextualTrackDone } from "../components/TrackDone";
import { DoneTracker } from "../done-tracker-interface";
import { NodeDoneTracker } from "../node-done-tracker";
import { TrackComponentDoneProps } from "../track-component-done";

type StoryWrapperProps = TrackComponentDoneProps<{
  children: any;
  storyArgs: any;
  hideForceRefresh?: boolean;
  disableStrictMode?: boolean;
  imperative?: boolean;
}>;

export default function StoryWrapper(props: StoryWrapperProps) {
  const [status, setStatus] = useState("pending");

  const {
    onDone,
    onAbort,
    onError,
    onPending,
    disableStrictMode,
    hideForceRefresh,
    children,
    storyArgs,
  } = props;

  const backgroundColor = {
    pending: "lightgray",
    done: "green",
    error: "red",
    aborted: "orange",
  }[status]!;

  const body = document.querySelector<HTMLElement>(".sb-show-main");
  if (body) body.style.backgroundColor = backgroundColor;

  const forceRefreshRef = useRef<(() => void) | null>(null);

  const TrackDone = props.imperative
    ? ImperativeTrackDone
    : ContextualTrackDone;

  // reset done tracker when component args change
  useEffect(() => {
    forceRefreshRef.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, Object.entries(storyArgs).flat());

  const wrapper = (
    <div style={{ padding: 16, backgroundColor }}>
      {!hideForceRefresh && (
        <div>
          <div
            style={{
              marginBottom: 8,
              padding: 8,
              backgroundColor: "#ffffffaa",
              borderRadius: 5,
              display: "inline-block",
            }}
          >
            <span style={{ marginRight: 4, fontSize: 14 }}>
              Root state: {status}
            </span>
            <button onClick={() => forceRefreshRef.current?.()}>
              🔄 New done tracker
            </button>
          </div>
        </div>
      )}
      <TrackDone
        doneTrackerName="StoryWrapperRoot"
        forceRefreshRef={forceRefreshRef}
        onDone={useCallback(() => {
          console.log("Story wrapper status", "done");
          onDone?.();
          setStatus("done");
        }, [onDone])}
        onAbort={useCallback(() => {
          console.log("Story wrapper status", "aborted");
          onAbort?.();
          setStatus("aborted");
        }, [onAbort])}
        onError={useCallback(
          (err: any, errSrc: DoneTracker) => {
            console.log("Story wrapper status", "error");
            onError?.(err, errSrc);
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
    </div>
  );

  return disableStrictMode ? (
    wrapper
  ) : (
    <React.StrictMode>{wrapper}</React.StrictMode>
  );
}

export const ContextualStoryDecorator = (
  wrapperProps: Omit<StoryWrapperProps, "children" | "storyArgs">
): Decorator =>
  function ContextualStoryWrapped(Story, { args }) {
    return (
      <StoryWrapper {...wrapperProps} storyArgs={args}>
        {Story()}
      </StoryWrapper>
    );
  };

export const ImperativeStoryDecorator = (
  wrapperProps: Omit<StoryWrapperProps, "children" | "storyArgs">
): Decorator =>
  function ImperativeStoryWrapped(Story, { args }) {
    return (
      <StoryWrapper {...wrapperProps} storyArgs={args} imperative={true}>
        {(doneTracker: NodeDoneTracker) =>
          // pass doneTracker as an extra arg to Story
          Story({ args: { ...args, doneTracker } })
        }
      </StoryWrapper>
    );
  };
