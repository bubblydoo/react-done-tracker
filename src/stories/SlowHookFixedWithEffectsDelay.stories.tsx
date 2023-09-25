import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { createSpyableActions, delay } from "./common";
import { TreeFixedWithEffectsDelay } from "./SlowStories";
import { ContextualStoryDecorator } from "./StoryWrapper";
import { expect } from "@storybook/jest";

const { actions } = createSpyableActions({
  onDone: action("done"),
  onAbort: action("abort"),
  onError: action("error"),
  onPending: action("pending"),
  onChange: action("change"),
});

export default {
  title: "Tests/Slow hook fixed with effects delay",
  component: TreeFixedWithEffectsDelay,
  decorators: [ContextualStoryDecorator(actions)],
} as Meta;

export const Primary = {
  args: {},
  play: async () => {
    await delay(3000);
    expect(actions.onDone).toBeCalledTimes(1); // pending -> done
  },
} as Meta;
