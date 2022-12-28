/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from "react";
import { action } from "@storybook/addon-actions";
import type { StoryFn, Meta } from "@storybook/react";
import Image from "../components/Image";
import { TrackComponentDoneProps } from "../track-component-done";
import { ContextualStoryHelper } from "./ContextualStoryWrapper";

const helperArgs = {
  onDone: action("done"),
  onAbort: action("abort"),
  onError: action("error"),
  onPending: action("pending"),
};

export default {
  title: "Contextual API/Image",
  component: Image,
  args: {},
} as Meta;

const Template: StoryFn<TrackComponentDoneProps> = (args, { component }) => {
  return (
    <ContextualStoryHelper {...helperArgs} args={args} component={component} />
  );
};

export const Primary = Template.bind({});
Primary.args = {
  src: "https://picsum.photos/200/300",
};

export const Error = Template.bind({});
Error.args = {
  src: "https://example.qwkeinasc",
};
