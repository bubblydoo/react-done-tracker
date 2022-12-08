import { DoneTrackedProps } from "../done-tracked";
import { LeafDoneTracker } from "../leaf-done-tracker";
import { useLeafDoneTracker } from "../use-leaf-done-tracker";

export default function ForkLeafDoneTracker({
  children,
  doneTracker: parentDoneTracker,
  ...args
}: DoneTrackedProps<
  { children: (doneTracker: LeafDoneTracker) => any } & Parameters<
    typeof useLeafDoneTracker
  >[1]
>) {
  const [doneTracker] = useLeafDoneTracker(parentDoneTracker, {
    name: "ForkLeafDoneTracker",
    ...args,
  });

  const childrenComponents = children?.(doneTracker);

  return childrenComponents;
}
