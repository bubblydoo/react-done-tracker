/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from "react";
import { action } from "@storybook/addon-actions";
import type { StoryFn, Meta } from "@storybook/react";
import StoryWrapper from "./story-wrapper";
import Image from "../components/Image";

export default {
  component: Image,
  args: {
    onDone: action("done"),
    onAbort: action("abort"),
    onError: action("error"),
    onPending: action("pending"),
  },
} as Meta;

const Template: StoryFn = (args, { component }) => (
  <StoryWrapper {...args} component={component} />
);

export const Primary = Template.bind({});
Primary.args = {
  src: "https://picsum.photos/200/300",
};
