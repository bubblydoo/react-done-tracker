import React from "react";
import { DoneTrackedProps } from "../done-tracked";
import { DoneTracker } from "../done-tracker";
import { useDoneTrackerRaw } from "../use-done-tracker-raw";

const componentStyle = (dt: DoneTracker): React.CSSProperties => {
  return {
    background: dt.done ? "green" : dt.error ? "red" : "lightgrey",
    position: "relative",
    margin: 8,
    padding: 8,
    paddingTop: 24,
    outline: "2px solid black",
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

export default function DoneVisualizer({
  name,
  doneTracker,
  children,
}: DoneTrackedProps<{
  name?: string;
  children?: (doneTracker: DoneTracker) => any;
}>) {
  const localDoneTracker = useDoneTrackerRaw(doneTracker, name);
  localDoneTracker.ensureWillHaveChildren();

  const childrenComponents = children?.(localDoneTracker);

  return (
    <div style={componentStyle(localDoneTracker)}>
      <div style={indicatorStyle}>{localDoneTracker.id}</div>
      {childrenComponents}
    </div>
  );
}
