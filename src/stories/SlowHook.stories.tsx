import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { createSpyableActions, delay } from "./common";
import { Tree } from "./SlowStories";
import { ContextualStoryDecorator } from "./StoryWrapper";
import { expect } from "@storybook/jest";

const { actions } = createSpyableActions({
  onDone: action("done"),
  onAbort: action("abort"),
  onError: action("error"),
  onPending: action("pending"),
});

export default {
  title: "Tests/Slow hook",
  component: Tree,
  decorators: [ContextualStoryDecorator(actions)],
} as Meta;

export const Primary = {
  args: {},
  play: async () => {
    await delay(3000);
    // this is undesired, but we still test it so we know that the
    // stories with "Fixed" are actually fixing something
    expect(actions.onDone).toBeCalledTimes(2); // pending -> done -> pending -> done
  },
} as Meta;
