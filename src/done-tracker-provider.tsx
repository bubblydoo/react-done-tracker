import React from "react";
import { DoneTrackerContext } from "./done-tracker-context";
import { NodeDoneTracker } from "./node-done-tracker";

export function DoneTrackerProvider(props: {
  doneTracker: NodeDoneTracker;
  children: any;
}) {
  return (
    <DoneTrackerContext.Provider value={props.doneTracker}>
      {props.children}
    </DoneTrackerContext.Provider>
  );
}
