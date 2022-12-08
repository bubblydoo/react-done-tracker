import { NodeDoneTracker } from "./node-done-tracker";

export type DoneTrackedProps<P> = { doneTracker: NodeDoneTracker } & P;
