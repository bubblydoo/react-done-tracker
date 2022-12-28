/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { action } from "@storybook/addon-actions";
import type { Meta } from "@storybook/react";
import Image from "../components/Image";
import { ContextualStoryDecorator } from "./StoryWrapper";

export default {
  title: "Contextual API/Image",
  component: Image,
  decorators: [
    ContextualStoryDecorator({
      onDone: action("done"),
      onAbort: action("abort"),
      onError: action("error"),
      onPending: action("pending"),
    }),
  ],
} as Meta;

export const Primary = {
  args: {
    src: "https://picsum.photos/200/300",
  },
};

export const Error = {
  args: {
    src: "https://example.qwkeinasc",
  },
};
