import { LeafDoneTracker } from "../leaf-done-tracker";
import { useDoneTracker } from "../use-done-tracker";

export function ForkLeafDoneTracker({
  children,
  ...args
}: { children: (doneTracker: LeafDoneTracker) => any } & Parameters<
  typeof useDoneTracker
>[0]) {
  const doneTracker = useDoneTracker({
    name: "ForkLeafDoneTracker",
    ...args,
  });

  const childrenComponents = children?.(doneTracker);

  return childrenComponents;
}
