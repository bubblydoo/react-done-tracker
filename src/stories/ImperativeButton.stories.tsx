import React from "react";
import { action } from "@storybook/addon-actions";
import type { StoryFn, Meta } from "@storybook/react";
import StoryWrapper from "./StoryWrapper";
import Button from "../components/ImperativeButton";
import { TrackComponentDoneProps } from "../track-component-done";

export default {
  title: 'Imperative API/Button',
  component: Button,
  args: {
    onDone: action("done"),
    onAbort: action("abort"),
    onError: action("error"),
    onPending: action("pending"),
    fullscreen: true,
  },
} as Meta;

const Template: StoryFn<TrackComponentDoneProps> = (args, { component }) => (
  <StoryWrapper {...args} component={component!} imperative={true} />
);

export const Primary = Template.bind({});
Primary.args = {
  children: "Click me",
  persistDone: false
};
