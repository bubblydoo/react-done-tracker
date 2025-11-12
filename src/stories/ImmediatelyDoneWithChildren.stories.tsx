import { Meta } from "@storybook/react-vite";
import React from "react";
import {
  ContextualStoryDecorator,
  RunBeforeRenderDecorator,
} from "./StoryWrapper";
import { useNodeDoneTracker } from "../use-node-done-tracker";
import { useImperativeDoneTracker } from "../use-imperative-done-tracker";
import { within } from "storybook/test";
import { expect } from "storybook/test";
import { createSpyableActions, delay, doneTrackerUtils } from "./common";
import { action } from "storybook/actions";

const Tree = () => {
  const parent = useNodeDoneTracker({ name: "Parent" });
  useImperativeDoneTracker(parent, { name: "Child 1", done: true });
  useImperativeDoneTracker(parent, { name: "Child 2", done: false });

  return <>done: {parent.done ? "yes" : "no"}</>;
};

const { actions, actionsMockClear } = createSpyableActions({
  onDone: action("done"),
  onAbort: action("abort"),
  onError: action("error"),
  onPending: action("pending"),
  onChange: action("change"),
});

export default {
  title: "Tests/Immediately Done With Children",
  component: Tree,
  decorators: [
    ContextualStoryDecorator(actions),
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

    expect(status()).toBe("pending");
    expect(actions.onDone).not.toBeCalled();

    refresh();

    await delay(100);

    expect(status()).toBe("pending");
    expect(actions.onDone).not.toBeCalled();
  },
} as Meta;
