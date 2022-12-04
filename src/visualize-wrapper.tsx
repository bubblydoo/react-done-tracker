import React, { ComponentPropsWithoutRef, ElementType } from "react";
import DoneVisualizer from "./components/DoneVisualizer";
import { DoneTrackedProps } from "./done-tracked";

export default function visualizeDoneWrapper<
  T extends ElementType,
  P = ComponentPropsWithoutRef<T>
>(Component: T, doneTrackerName?: string): React.FC<DoneTrackedProps<P>> {
  return function visualizeDoneHOC({ doneTracker, ...props }) {
    const name = doneTrackerName || (Component as any)?.displayName;
    return (
      <DoneVisualizer name={"Visualizer for " + name} doneTracker={doneTracker}>
        {(doneTracker) => (
          <Component {...(props as any)} doneTracker={doneTracker} />
        )}
      </DoneVisualizer>
    );
  };
}
