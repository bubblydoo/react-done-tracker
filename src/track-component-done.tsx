import { DoneTracker } from "./done-tracker-interface";

export type TrackComponentDoneProps<P = any> = {
  onDone?: () => void;
  onAbort?: () => void;
  onError?: (err: any, source: DoneTracker) => void;
  onPending?: () => void;
  onChange?: () => void;
} & Omit<P, "onDone" | "onAbort" | "onError" | "onPending" | "onChange">;
