/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from "react";
import { action } from "@storybook/addon-actions";
import type { StoryFn, Meta } from "@storybook/react";
import StoryWrapper from "./StoryWrapper";
import Image from "../components/ImperativeImage";
import { TrackComponentDoneProps } from "../track-component-done";

export default {
  title: 'Imperative API/Image',
  component: Image,
  args: {
    onDone: action("done"),
    onAbort: action("abort"),
    onError: action("error"),
    onPending: action("pending"),
  },
} as Meta;

const Template: StoryFn<TrackComponentDoneProps> = (args, { component }) => (
  <StoryWrapper {...args} component={component!} imperative={true} />
);

export const Primary = Template.bind({});
Primary.args = {
  src: "https://picsum.photos/200/300",
};

export const Error = Template.bind({});
Error.args = {
  src: "https://example.qwkeinasc/",
};
