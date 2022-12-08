import { DoneTrackedProps } from "../done-tracked";
import { DoneTracker } from "../done-tracker";
import { useDoneTracker } from "../use-done-tracker";

export default function ForkDoneTracker({
  children,
  doneTracker: parentDoneTracker,
  ...args
}: DoneTrackedProps<
  { children: (doneTracker: DoneTracker) => any } & Parameters<
    typeof useDoneTracker
  >[1]
>) {
  const [doneTracker] = useDoneTracker(parentDoneTracker, {
    name: "ForkDoneTracker",
    ...args,
  });

  const childrenComponents = children?.(doneTracker);

  return childrenComponents;
}
