import { DoneTracker } from "./done-tracker";

export type DoneTrackedProps<P> = { doneTracker: DoneTracker } & P;
