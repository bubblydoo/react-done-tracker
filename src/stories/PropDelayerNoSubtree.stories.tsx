import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import React from "react";
import { ContextualStoryDecorator } from "./StoryWrapper";
import { useDoneTracker } from "../use-done-tracker";
import { useState } from "react";
import Image from "../components/Image";
import { useEffect } from "react";
import { visualizeDoneWrapper } from "../visualize-wrapper";

// Through the context, the done tracker travels faster than the props

function PropDelayer<T>({
  children,
  ...props
}: { children: (props: Omit<T, "children"> | null) => any } & T) {
  const [usedProps, setUsedProps] = useState<Omit<T, "children"> | null>(null);

  useDoneTracker({
    name: "Async op",
    done: JSON.stringify(usedProps) === JSON.stringify(props),
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => setUsedProps(props), 2500);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, Object.values(props));

  if (usedProps) return children(usedProps);
}

const PropDelayerVisualized: typeof PropDelayer = visualizeDoneWrapper(PropDelayer);

const Tree = (props: { src: string }) => {
  return <PropDelayerVisualized src={props.src}>
    {(delayedProps) => <Image src={delayedProps?.src} />}
  </PropDelayerVisualized>;
};

// It's recommended to use a subtree because it will cause less resets
// but it should still work without it
export default {
  title: "Tests/Prop delayer no subtree",
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
