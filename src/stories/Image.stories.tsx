/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from "react";
import { action } from "@storybook/addon-actions";
import type { StoryFn, Meta } from "@storybook/react";
import Image from "../components/Image";
import { TrackComponentDoneProps } from "../track-component-done";
import { ContextualStoryHelper } from "./ContextualStoryWrapper";

export default {
  title: "Contextual API/Image",
  component: Image,
  args: {
    onDone: action("done"),
    onAbort: action("abort"),
    onError: action("error"),
    onPending: action("pending"),
    fullscreen: true,
  },
} as Meta;

const Template: StoryFn<TrackComponentDoneProps> = (args, { component }) => {
  return <ContextualStoryHelper args={args} component={component} />;
};

export const Primary = Template.bind({});
Primary.args = {
  src: "https://picsum.photos/200/300",
};

export const Error = Template.bind({});
Error.args = {
  src: "https://example.qwkeinasc/",
};
