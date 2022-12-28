import React from "react";
import { action } from "@storybook/addon-actions";
import type { StoryFn, Meta } from "@storybook/react";
import StoryWrapper from "./StoryWrapper";
import Button from "../components/Button";
import { TrackComponentDoneProps } from "../track-component-done";

export default {
  title: 'Contextual API/Button',
  component: Button,
  args: {
    onDone: action("done"),
    onAbort: action("abort"),
    onError: action("error"),
    onPending: action("pending"),
  },
} as Meta;

const Template: StoryFn<TrackComponentDoneProps> = (args, { component }) => (
  <StoryWrapper {...args} component={component!} />
);

export const Primary = Template.bind({});
Primary.args = {
  children: "Click me",
  persistDone: false
};
