import { useDoneTrackerContext } from "./use-done-tracker-context";
import { useImperativeDoneTracker } from "./use-imperative-done-tracker";

// eslint-disable-next-line @typescript-eslint/ban-types
type Params = Parameters<typeof useImperativeDoneTracker>[1] & {};

export const useDoneTracker = (params: Params) => {
  const parentDoneTracker = useDoneTrackerContext();

  return useImperativeDoneTracker(parentDoneTracker, params);
}
