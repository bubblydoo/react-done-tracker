import { LeafDoneTracker } from "../leaf-done-tracker";
import { useLeafDoneTracker } from "../use-leaf-done-tracker";

export default function ForkLeafDoneTracker({
  children,
  ...args
}: { children: (doneTracker: LeafDoneTracker) => any } & Parameters<
  typeof useLeafDoneTracker
>[0]) {
  const doneTracker = useLeafDoneTracker({
    name: "ForkLeafDoneTracker",
    ...args,
  });

  const childrenComponents = children?.(doneTracker);

  return childrenComponents;
}
