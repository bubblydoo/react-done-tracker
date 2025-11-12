import { action } from "storybook/actions";
import { Meta } from "@storybook/react-vite";
import { createSpyableActions, delay } from "./common";
import { TreeFixed } from "./SlowStories";
import { ContextualStoryDecorator } from "./StoryWrapper";
import { expect } from "storybook/test";

const { actions, actionsMockClear } = createSpyableActions({
  onDone: action("done"),
  onAbort: action("abort"),
  onError: action("error"),
  onPending: action("pending"),
  onChange: action("change"),
});

export default {
  title: "Tests/Slow hook fixed",
  component: TreeFixed,
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
