import { action } from "@storybook/addon-actions";
import type { Meta } from "@storybook/react";
import Button from "../components/Button";
import { ContextualStoryDecorator } from "./StoryWrapper";

export default {
  title: "Contextual API/Button",
  component: Button,
  decorators: [
    ContextualStoryDecorator({
      onDone: action("done"),
      onAbort: action("abort"),
      onError: action("error"),
      onPending: action("pending"),
    }),
  ],
} as Meta;

export const Primary = { args: { children: "Click me", persistDone: false } };
