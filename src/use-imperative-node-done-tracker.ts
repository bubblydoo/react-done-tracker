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
     * Use skip when the children of this tree are not yet rendered or
     * if they are not yet correctly rendered (e.g. rendered with outdated props).
     *
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
  // uncomment when we want to
  // calculate doneness excessively
  // localDoneTracker.calculateDoneness();

  return localDoneTracker;
};
