import React from "react";
import { ImperativeDoneTrackedProps } from "../imperative-done-tracked";
import { DoneTracker } from "../done-tracker-interface";
import { NodeDoneTracker } from "../node-done-tracker";
import { useImperativeNodeDoneTracker } from "../use-imperative-node-done-tracker";

const componentStyle = (dt: DoneTracker): React.CSSProperties => {
  return {
    background: dt.done ? "green" : dt.errored ? "red" : "lightgrey",
    position: "relative",
    margin: 8,
    padding: 8,
    paddingTop: 24,
    outline: "2px solid black",
    display: "inline-block",
    minWidth: 'calc(100% - 2 * 8px)',
  };
};

const indicatorStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  fontSize: 14,
  padding: "2px 4px",
  borderBottomRightRadius: 5,
  borderStyle: "solid",
  borderWidth: "0 2px 2px 0",
  background: "#ffffff88",
};

export default function ImperativeDoneVisualizer({
  name,
  doneTracker,
  children,
}: ImperativeDoneTrackedProps<{
  name?: string;
  children?: (doneTracker: NodeDoneTracker) => any;
}>) {
  const localDoneTracker = useImperativeNodeDoneTracker(doneTracker, {
    name: name || "Visualizer"
  });

  const childrenComponents = children?.(localDoneTracker);

  return (
    <div style={componentStyle(localDoneTracker)}>
      <div style={indicatorStyle}>{localDoneTracker.id}</div>
      {childrenComponents}
    </div>
  );
}
