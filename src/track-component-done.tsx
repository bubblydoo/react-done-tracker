import React, {
  ComponentType,
  MutableRefObject,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { useRootDoneTracker } from "./use-root-done-tracker";
import { DoneTrackerListener } from "./done-tracker-interface";
import DoneTrackerProvider from "./done-tracker-provider";

export type TrackComponentDoneProps<P = any> = {
  onDone: DoneTrackerListener<"done">;
  onAbort: DoneTrackerListener<"abort">;
  onError: DoneTrackerListener<"error">;
  onPending: () => any;
} & Omit<P, "onDone" | "onAbort" | "onError" | "onPending">;

/**
 * This wrapper wraps a done-trackable component and exposes the done tracker lifecycle
 * as props on the component.
 *
 * @example
 * ```
 * const RootImage = trackComponentDone(Image);
 *
 * <RootImage src={'https://example.com'} onDone={() => setDone(true)} />
 * ```
 *
 * @param Component Component that is wrapped
 * @param options.imperative Whether `Component` uses the imperative API (default: `false`)
 * @param options.forceRefreshRef Ref to a function to force refresh the done tracker
 * @param options.doneTrackerName Name of the done tracker
 */
export function trackComponentDone<T extends ComponentType<P>, P = any>(
  Component: T,
  {
    imperative = false,
    forceRefreshRef,
    doneTrackerName = "Root",
  }: {
    imperative?: boolean;
    forceRefreshRef?: MutableRefObject<(() => void) | null>;
    doneTrackerName?: string;
  } = {}
): React.ComponentType<TrackComponentDoneProps<P>> {
  return React.forwardRef<any, TrackComponentDoneProps<P>>(
    function TrackComponentDone(
      { onDone, onAbort, onError, onPending, ...props },
      ref
    ) {
      const [tick, rerender] = useReducer((i: number) => i + 1, 0);
      if (forceRefreshRef) {
        forceRefreshRef.current = () => rerender();
      }

      const doneTracker = useRootDoneTracker(doneTrackerName, [
        tick,
        ...Object.values(props),
      ]);

      useEffect(() => {
        const onDoneFn: DoneTrackerListener<"done"> = (info) => onDone(info);
        const onAbortFn: DoneTrackerListener<"abort"> = (info) => onAbort(info);
        const onErrorFn: DoneTrackerListener<"error"> = (info) => onError(info);

        doneTracker.addEventListener("done", onDoneFn);
        doneTracker.addEventListener("abort", onAbortFn);
        doneTracker.addEventListener("error", onErrorFn);

        return () => {
          doneTracker.removeEventListener("done", onDoneFn);
          doneTracker.removeEventListener("abort", onAbortFn);
          doneTracker.removeEventListener("error", onErrorFn);
        };
      }, [onDone, onAbort, onError, doneTracker]);

      // use useMemo because useEffect is too slow
      // eslint-disable-next-line react-hooks/exhaustive-deps
      useMemo(() => onPending?.(), [onPending, doneTracker]);

      // TODO: fix types
      const C = Component as any;
      const componentProps = { ...props, ref };
      return imperative ? (
        <C {...componentProps} doneTracker={doneTracker} />
      ) : (
        <DoneTrackerProvider doneTracker={doneTracker}>
          <C {...componentProps} />
        </DoneTrackerProvider>
      );
    }
  ) as any; // TODO: fix types
}
