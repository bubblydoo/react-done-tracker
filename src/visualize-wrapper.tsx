import React, { ComponentPropsWithoutRef, ElementType } from "react";
import ImperativeDoneVisualizer from "./components/ImperativeDoneVisualizer";
import { DoneTrackerContext } from "./done-tracker-context";
import { ImperativeDoneTrackedProps } from "./imperative-done-tracked";
import { useDoneTrackerContext } from "./use-done-tracker-context";

export function visualizeDoneWrapper<
  T extends ElementType,
  P = ComponentPropsWithoutRef<T>
>(Component: T, doneTrackerName?: string): React.FC<P> {
  return function VisualizeDoneContextual(props: P) {
    const doneTracker = useDoneTrackerContext();

    const name = doneTrackerName || (Component as any)?.displayName;

    return (
      <ImperativeDoneVisualizer
        name={"Visualizer for " + name}
        doneTracker={doneTracker}
      >
        {(doneTracker) => (
          <DoneTrackerContext.Provider value={doneTracker}>
            <Component {...(props as any)} />
          </DoneTrackerContext.Provider>
        )}
      </ImperativeDoneVisualizer>
    );
  };
}

export function imperativeVisualizeDoneWrapper<
  T extends ElementType<ImperativeDoneTrackedProps<any>>,
  P = ComponentPropsWithoutRef<T>
>(
  Component: T,
  doneTrackerName?: string
): React.FC<ImperativeDoneTrackedProps<P>> {
  return function VisualizeDoneImperative(
    props: ImperativeDoneTrackedProps<P>
  ) {
    const name = doneTrackerName || (Component as any)?.displayName;
    return (
      <ImperativeDoneVisualizer
        name={"Visualizer for " + name}
        doneTracker={props.doneTracker}
      >
        {(doneTracker) => (
          <Component {...(props as any)} doneTracker={doneTracker} />
        )}
      </ImperativeDoneVisualizer>
    );
  };
}
