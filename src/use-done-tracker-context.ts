import { useContext } from "react";
import { DoneTrackerContext } from "./done-tracker-context";
import { DoneTrackerError } from "./done-tracker-error";

export const useDoneTrackerContext = () => {
  const parentDoneTracker = useContext(DoneTrackerContext);

  if (!parentDoneTracker)
    throw new DoneTrackerError(
      "No parent done tracker context detected. Did you forget to add the done tracker context or are you using the imperative api?"
    );

  return parentDoneTracker;
};
