import { useDoneTrackerContext } from "./use-done-tracker-context";
import { useImperativeLeafDoneTracker } from "./use-imperative-leaf-done-tracker";

// eslint-disable-next-line @typescript-eslint/ban-types
type Params = Parameters<typeof useImperativeLeafDoneTracker>[1] & {};

export const useLeafDoneTracker = (params: Params) => {
  const parentDoneTracker = useDoneTrackerContext();

  return useImperativeLeafDoneTracker(parentDoneTracker, params);
}
