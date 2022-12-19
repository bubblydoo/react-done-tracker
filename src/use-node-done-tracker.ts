import { useDoneTrackerContext } from "./use-done-tracker-context";
import { useImperativeNodeDoneTracker } from "./use-imperative-node-done-tracker";

// eslint-disable-next-line @typescript-eslint/ban-types
type Params = Parameters<typeof useImperativeNodeDoneTracker>[1] & {};

export const useNodeDoneTracker = (params?: Params) => {
  const parentDoneTracker = useDoneTrackerContext();

  return useImperativeNodeDoneTracker(parentDoneTracker, params);
}
