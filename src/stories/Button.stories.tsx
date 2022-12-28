import React from "react";
import { action } from "@storybook/addon-actions";
import type { StoryFn, Meta } from "@storybook/react";
import Button from "../components/Button";
import { TrackComponentDoneProps } from "../track-component-done";
import { ContextualStoryHelper } from "./ContextualStoryWrapper";

const helperArgs = {
  onDone: action("done"),
  onAbort: action("abort"),
  onError: action("error"),
  onPending: action("pending"),
};

export default {
  title: "Contextual API/Button",
  component: Button,
  args: {},
} as Meta;

const Template: StoryFn<TrackComponentDoneProps> = (args, { component }) => {
  return (
    <ContextualStoryHelper {...helperArgs} args={args} component={component} />
  );
};

export const Primary = Template.bind({});
Primary.args = {
  children: "Click me",
  persistDone: false,
};
