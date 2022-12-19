import { NodeDoneTracker } from "./node-done-tracker";

export type ImperativeDoneTrackedProps<P> = { doneTracker: NodeDoneTracker } & P;
