import { ImperativeDoneTrackedProps } from "../imperative-done-tracked";
import { NodeDoneTracker } from "../node-done-tracker";
import { useImperativeNodeDoneTracker } from "../use-imperative-node-done-tracker";

export default function ImperativeForkNodeDoneTracker({
  children,
  doneTracker: parentDoneTracker,
  ...args
}: ImperativeDoneTrackedProps<
  { children: (doneTracker: NodeDoneTracker) => any } & Parameters<
    typeof useImperativeNodeDoneTracker
  >[1]
>) {
  const doneTracker = useImperativeNodeDoneTracker(parentDoneTracker, {
    name: "ForkNodeDoneTracker",
    ...args,
  });

  const childrenComponents = children?.(doneTracker);

  return childrenComponents;
}
