import { action } from "@storybook/addon-actions";
import type { Meta } from "@storybook/react";
import { ImperativeStoryDecorator } from "./StoryWrapper";
import Button from "../components/ImperativeButton";

export default {
  title: "Imperative API/Button",
  component: Button,
  decorators: [
    ImperativeStoryDecorator({
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
    children: "Click me",
    persistDone: false,
  },
};
