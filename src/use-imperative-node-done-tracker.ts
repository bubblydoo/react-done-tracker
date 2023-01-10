import { DoneTrackerError } from "./done-tracker-error";
import { NodeDoneTracker } from "./node-done-tracker";
import { useDoneTrackerRaw } from "./use-done-tracker-raw";
import { useTemporarilySkipNodeDoneTracker } from "./use-temporarily-skip-node-done-tracker";

export const useImperativeNodeDoneTracker = (
  doneTracker: NodeDoneTracker,
  {
    name,
    skip = false,
  }: {
    name?: string;
    /**
     * If the children are not always registered within one `useEffect` after creating this done tracker,
     * use this flag.
     * When the children are rendered/registered, change it to false.
     */
    skip?: boolean;
  } = {}
) => {
  if (!doneTracker)
    throw new DoneTrackerError(
      "Falsy doneTracker passed to useImperativeNodeDoneTracker"
    );

  const localDoneTracker = useDoneTrackerRaw(doneTracker, "node", name);

  useTemporarilySkipNodeDoneTracker(localDoneTracker, skip);

  return localDoneTracker;
};
