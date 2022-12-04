import { DoneTrackedProps } from "../done-tracked";
import { DoneTracker } from "../done-tracker";
import { useDoneTracker } from "../use-done-tracker";

export default function ForkDoneTracker(
  props: DoneTrackedProps<{ children: (doneTracker: DoneTracker) => any }>
) {
  const [doneTracker] = useDoneTracker(props.doneTracker, {
    name: "ForkDoneTracker",
  });

  const childrenComponents = props.children?.(doneTracker);

  return childrenComponents;
}
