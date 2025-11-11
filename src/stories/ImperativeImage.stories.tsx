/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { action } from "storybook/actions";
import type { Meta } from "@storybook/react-vite";
import { ImperativeStoryDecorator } from "./StoryWrapper";
import Image from "../components/ImperativeImage";

export default {
  title: "Imperative API/Image",
  component: Image,
  decorators: [
    ImperativeStoryDecorator({
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
    src: "https://example.qwkeinasc/",
  },
};
