import { ImperativeDoneTrackedProps } from "../imperative-done-tracked";
import { LeafDoneTracker } from "../leaf-done-tracker";
import { useImperativeLeafDoneTracker } from "../use-imperative-leaf-done-tracker";

export default function ImperativeForkLeafDoneTracker({
  children,
  doneTracker: parentDoneTracker,
  ...args
}: ImperativeDoneTrackedProps<
  { children: (doneTracker: LeafDoneTracker) => any } & Parameters<
    typeof useImperativeLeafDoneTracker
  >[1]
>) {
  const doneTracker = useImperativeLeafDoneTracker(parentDoneTracker, {
    name: "ForkLeafDoneTracker",
    ...args,
  });

  const childrenComponents = children?.(doneTracker);

  return childrenComponents;
}
