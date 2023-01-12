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

  // if (localDoneTracker.done && skip) {
  //   (localDoneTracker as any)._done = false;
  //   localDoneTracker.skip = true;
  // }

  useTemporarilySkipNodeDoneTracker(localDoneTracker, skip);

  // if (localDoneTracker.done && skip) {
  //   warn(
  //     "Node done tracker",
  //     localDoneTracker.id,
  //     "is already done, but its hook is now receiving skip:",
  //     skip,
  //     "When going back to a loading state, also supply a new done tracker."
  //   );
  // }

  // uncomment when we want to
  // calculate doneness excessively
  // localDoneTracker.calculateDoneness();

  return localDoneTracker;
};
