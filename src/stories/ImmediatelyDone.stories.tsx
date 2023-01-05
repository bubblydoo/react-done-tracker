import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import React from "react";
import { visualizeDoneWrapper } from "../visualize-wrapper";
import { ContextualStoryDecorator } from "./StoryWrapper";
import { useLeafDoneTracker } from "../use-leaf-done-tracker";
import { createSpyableActions, delay, doneTrackerUtils } from "./common";
import { within } from "@storybook/testing-library";
import { expect } from "@storybook/jest";

function ImmediatelyDone() {
  useLeafDoneTracker({
    name: "ImmediatelyDone",
    done: true
  });

  return (
    <>done</>
  );
}

const ImmediatelyDoneVisualizer = visualizeDoneWrapper(ImmediatelyDone, "ImmediatelyDone");

const { actions, actionsMockClear } = createSpyableActions({
  onDone: action("done"),
  onAbort: action("abort"),
  onError: action("error"),
  onPending: action("pending"),
});

export default {
  title: "Contextual API/Immediately Done",
  component: ImmediatelyDoneVisualizer,
  decorators: [
    ContextualStoryDecorator(actions),
  ],
} as Meta;

export const Primary = {};

export const InteractionTest: Meta = {
  play: async ({ canvasElement }) => {
    await delay(500);

    const canvas = within(canvasElement);
    const { status, refresh } = await doneTrackerUtils(canvas);
    actionsMockClear();

    expect(status()).toBe("done");
    refresh();
    await delay(500);
    expect(status()).toBe("done");
  }
}
