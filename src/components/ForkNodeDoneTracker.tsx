import { DoneTrackedProps } from "../done-tracked";
import { NodeDoneTracker } from "../node-done-tracker";
import { useNodeDoneTracker } from "../use-node-done-tracker";

export default function ForkNodeDoneTracker({
  children,
  doneTracker: parentDoneTracker,
  ...args
}: DoneTrackedProps<
  { children: (doneTracker: NodeDoneTracker) => any } & Parameters<
    typeof useNodeDoneTracker
  >[1]
>) {
  const doneTracker = useNodeDoneTracker(parentDoneTracker, {
    name: "ForkNodeDoneTracker",
    ...args,
  });

  const childrenComponents = children?.(doneTracker);

  return childrenComponents;
}
