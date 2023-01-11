import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import React from "react";
import { ContextualStoryDecorator, RunBeforeRenderDecorator } from "./StoryWrapper";
import { useLeafDoneTracker } from "../use-leaf-done-tracker";
import { useState } from "react";
import { useNodeDoneTracker } from "../use-node-done-tracker";
import { DoneTrackerProvider } from "../done-tracker-provider";
import { useEffect } from "react";
import { createSpyableActions, delay, doneTrackerUtils } from "./common";
import { within, waitFor } from "@storybook/testing-library";
import { expect } from "@storybook/jest";

const { actions, actionsMockClear } = createSpyableActions({
  onDone: action("done"),
  onAbort: action("abort"),
  onError: action("error"),
  onPending: action("pending"),
});

const Tree = () => {
  const [delaying, setDelaying] = useState(true);
  useLeafDoneTracker({
    name: "Async op",
    done: !delaying,
  });
  const subtreeDoneTracker = useNodeDoneTracker({
    name: "Subtree",
    skip: delaying,
  });

  useEffect(() => {
    if (!delaying) return;
    const timeoutId = setTimeout(() => setDelaying(false), 1000);
    return () => clearTimeout(timeoutId);
  }, [delaying]);

  if (delaying) return <>Delaying...</>;
  return (
    <DoneTrackerProvider doneTracker={subtreeDoneTracker}>
      <div>just a normal div here</div>
    </DoneTrackerProvider>
  );
};

export default {
  title: "Tests/Empty node using skip",
  component: Tree,
  decorators: [
    ContextualStoryDecorator({ ...actions, disableStrictMode: true }),
    RunBeforeRenderDecorator(actionsMockClear),
  ],
} as Meta;

export const Primary = { args: {} } as Meta;

export const InteractionTest = {
  args: {},
  play: async ({ canvasElement }) => {
    await delay(500);

    const canvas = within(canvasElement);
    const { status, refresh } = await doneTrackerUtils(canvas);

    await waitFor(() => expect(status()).toBe("done"), { timeout: 2000 });
    await delay(100);
    expect(actions.onDone).toBeCalled();
    actionsMockClear();
    refresh();
    await delay(100);
    expect(status()).toBe("done");
    expect(actions.onPending).not.toBeCalled();
    expect(actions.onDone).toBeCalled();
  },
} as Meta;
