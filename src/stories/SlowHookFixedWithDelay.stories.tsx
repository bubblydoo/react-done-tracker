import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { createSpyableActions, delay } from "./common";
import { TreeFixedWithDelay } from "./SlowStories";
import { ContextualStoryDecorator } from "./StoryWrapper";
import { expect } from "@storybook/test";

const { actions, actionsMockClear } = createSpyableActions({
  onDone: action("done"),
  onAbort: action("abort"),
  onError: action("error"),
  onPending: action("pending"),
  onChange: action("change"),
});

export default {
  title: "Tests/Slow hook fixed with delay",
  component: TreeFixedWithDelay,
  decorators: [ContextualStoryDecorator(actions)],
} as Meta;

export const Primary = {
  args: {},
  play: async ({ canvas }) => {
    await delay(2000);
    actionsMockClear();
    canvas.getByRole("button", { name: /increment/i }).click();
    await delay(2000);
    expect(actions.onDone).toBeCalledTimes(1); // pending -> done
  },
} as Meta;
