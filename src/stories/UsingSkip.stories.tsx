import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import React from "react";
import ImperativeDelayedComponent from "../components/ImperativeDelayedComponent";
import { imperativeToContextual } from "../imperative-to-contextual";
import { ContextualStoryDecorator } from "./StoryWrapper";
import { useDoneTracker } from "../use-done-tracker";
import { useState } from "react";
import { useNodeDoneTracker } from "../use-node-done-tracker";
import { DoneTrackerProvider } from "../done-tracker-provider";
import Image from "../components/Image";
import { useEffect } from "react";

const DelayedComponent = imperativeToContextual(ImperativeDelayedComponent);

const Tree = () => {
  const [delaying, setDelaying] = useState(true);
  const asyncOpDoneTracker = useDoneTracker({
    name: "Async op",
    done: !delaying,
  });
  const subtreeDoneTracker = useNodeDoneTracker({
    name: "Subtree",
    skip: delaying
  });

  useEffect(() => setDelaying(true), [asyncOpDoneTracker]);

  useEffect(() => {
    if (!delaying) return;
    const timeoutId = setTimeout(() => setDelaying(false), 2000);
    return () => clearTimeout(timeoutId);
  }, [delaying]);

  if (delaying) return <>Delaying...</>;
  return (
    <DoneTrackerProvider doneTracker={subtreeDoneTracker}>
      <DelayedComponent delay={1000} />
      <Image src={"https://picsum.photos/100/100"} />
    </DoneTrackerProvider>
  );
};

export default {
  title: "Contextual API/Using skip",
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

export const Primary = { args: {} };
