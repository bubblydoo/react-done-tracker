import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import React from "react";
import { visualizeDoneWrapper } from "../visualize-wrapper";
import {
  ContextualStoryDecorator,
  RunBeforeRenderDecorator,
} from "./StoryWrapper";
import { useDoneTracker } from "../use-done-tracker";
import { createSpyableActions, delay, doneTrackerUtils } from "./common";
import { within } from "@storybook/test";
import { expect } from "@storybook/test";

function ImmediatelyErroring() {
  useDoneTracker({
    name: "ImmediatelyErroring",
    error: "error",
  });

  return <>oops</>;
}

const ImmediatelyErroringVisualizer = visualizeDoneWrapper(
  ImmediatelyErroring,
  "ImmediatelyErroring",
);

const { actions, actionsMockClear } = createSpyableActions({
  onDone: action("done"),
  onAbort: action("abort"),
  onError: action("error"),
  onPending: action("pending"),
  onChange: action("change"),
});

export default {
  title: "Contextual API/Immediately Erroring",
  component: ImmediatelyErroringVisualizer,
  decorators: [
    ContextualStoryDecorator(actions),
    RunBeforeRenderDecorator(actionsMockClear),
  ],
} as Meta;

export const Primary = {};

export const InteractionTest: Meta = {
  play: async ({ canvasElement }) => {
    await delay(500);

    const canvas = within(canvasElement);
    const { status, refresh } = await doneTrackerUtils(canvas);

    expect(status()).toBe("error");
    expect(actions.onPending).not.toBeCalled();
    expect(actions.onError).toBeCalled();
    actionsMockClear();
    refresh();
    await delay(500);
    expect(status()).toBe("error");
    expect(actions.onPending).not.toBeCalled();
    expect(actions.onError).toBeCalled();
  },
};
