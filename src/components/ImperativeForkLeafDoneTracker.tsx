import { ImperativeDoneTrackedProps } from "../imperative-done-tracked";
import { LeafDoneTracker } from "../leaf-done-tracker";
import { useImperativeDoneTracker } from "../use-imperative-done-tracker";

export default function ImperativeForkLeafDoneTracker({
  children,
  doneTracker: parentDoneTracker,
  ...args
}: ImperativeDoneTrackedProps<
  { children: (doneTracker: LeafDoneTracker) => any } & Parameters<
    typeof useImperativeDoneTracker
  >[1]
>) {
  const doneTracker = useImperativeDoneTracker(parentDoneTracker, {
    name: "ForkLeafDoneTracker",
    ...args,
  });

  const childrenComponents = children?.(doneTracker);

  return childrenComponents;
}
