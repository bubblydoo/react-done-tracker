import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import React from "react";
import { ContextualStoryDecorator } from "./StoryWrapper";
import { useDoneTracker } from "../use-done-tracker";
import { useState } from "react";
import { useNodeDoneTracker } from "../use-node-done-tracker";
import { DoneTrackerProvider } from "../done-tracker-provider";
import Image from "../components/Image";
import { useEffect } from "react";
import { visualizeDoneWrapper } from "../visualize-wrapper";

// Through the context, the done tracker travels faster than the props

function PropDelayer<T>({
  children,
  ...props
}: { children: (props: Omit<T, "children"> | null) => any } & T) {
  const [usedProps, setUsedProps] = useState<Omit<T, "children"> | null>(null);

  const asyncOpDoneTracker = useDoneTracker({
    name: "Async op",
    done: JSON.stringify(usedProps) === JSON.stringify(props),
  });
  const subtreeDoneTracker = useNodeDoneTracker({
    name: "Subtree",
    skip: !asyncOpDoneTracker.done,
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => setUsedProps(props), 2500);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, Object.values(props));

  return (
    <DoneTrackerProvider doneTracker={subtreeDoneTracker}>
      {usedProps && children(usedProps)}
    </DoneTrackerProvider>
  );
}

const PropDelayerVisualized: typeof PropDelayer = visualizeDoneWrapper(
  PropDelayer
) as any;

const Tree = (props: { src: string }) => {
  return (
    <PropDelayerVisualized src={props.src}>
      {(delayedProps) => <Image src={delayedProps?.src} />}
    </PropDelayerVisualized>
  );
};

export default {
  title: "Contextual API/Prop delayer",
  component: Tree,
  decorators: [
    ContextualStoryDecorator({
      onDone: action("done"),
      onAbort: action("abort"),
      onError: action("error"),
      onPending: action("pending"),
      onChange: action("change"),
    }),
  ],
} as Meta;

export const Primary = {
  args: {
    src: "https://picsum.photos/200",
  },
};
