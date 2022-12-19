import React from "react";
import { NodeDoneTracker } from "./node-done-tracker";

export const DoneTrackerContext = React.createContext<NodeDoneTracker | null>(null);
