import React, { ComponentPropsWithoutRef, ElementType } from "react";
import ImperativeDoneVisualizer from "./components/ImperativeDoneVisualizer";
import { DoneTrackerContext } from "./done-tracker-context";
import { ImperativeDoneTrackedProps } from "./imperative-done-tracked";
import { useDoneTrackerContext } from "./use-done-tracker-context";

export function visualizeDoneWrapper<
  T extends ElementType,
  P = ComponentPropsWithoutRef<T>
>(Component: T, doneTrackerName?: string): React.FC<P> {
  const displayName = (Component as any).displayName;

  const VisualizeDoneWrapper = (props: P) => {
    const doneTracker = useDoneTrackerContext();

    const name = doneTrackerName || (Component as any)?.displayName;
    const visualizerName = name ? "Visualizer for " + name : "Visualizer";

    return (
      <ImperativeDoneVisualizer name={visualizerName} doneTracker={doneTracker}>
        {(doneTracker) => (
          <DoneTrackerContext.Provider value={doneTracker}>
            <Component {...(props as any)} />
          </DoneTrackerContext.Provider>
        )}
      </ImperativeDoneVisualizer>
    );
  };

  VisualizeDoneWrapper.displayName = displayName
    ? `VisualizeDoneWrapper(${displayName})`
    : "VisualizeDoneWrapper";

  return VisualizeDoneWrapper;
}

export function imperativeVisualizeDoneWrapper<
  T extends ElementType<ImperativeDoneTrackedProps<any>>,
  P = ComponentPropsWithoutRef<T>
>(
  Component: T,
  doneTrackerName?: string
): React.FC<ImperativeDoneTrackedProps<P>> {
  const displayName = (Component as any).displayName;

  const ImperativeVisualizeDoneWrapper = (
    props: ImperativeDoneTrackedProps<P>
  ) => {
    const name = doneTrackerName || displayName;
    const visualizerName = name ? "Visualizer for " + name : "Visualizer";

    return (
      <ImperativeDoneVisualizer
        name={visualizerName}
        doneTracker={props.doneTracker}
      >
        {(doneTracker) => (
          <Component {...(props as any)} doneTracker={doneTracker} />
        )}
      </ImperativeDoneVisualizer>
    );
  };

  ImperativeVisualizeDoneWrapper.displayName = displayName
    ? `ImperativeVisualizeDoneWrapper(${displayName})`
    : "ImperativeVisualizeDoneWrapper";

  return ImperativeVisualizeDoneWrapper;
}
