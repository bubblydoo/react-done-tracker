import { action } from "@storybook/addon-actions";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import StoryWrapper from "./StoryWrapper";
import OrigImperativeForkLeafDoneTracker from "../components/ImperativeForkLeafDoneTracker";
import { useImperativeNodeDoneTracker } from "../use-imperative-node-done-tracker";
import { NodeDoneTracker } from "../node-done-tracker";
import { imperativeVisualizeDoneWrapper } from "../visualize-wrapper";
import { TrackComponentDoneProps } from "../track-component-done";

const ImperativeForkLeafDoneTracker = imperativeVisualizeDoneWrapper(
  OrigImperativeForkLeafDoneTracker,
);

const Input = (props: { doneTracker: NodeDoneTracker; imageSrc: string }) => {
  const doneTracker = useImperativeNodeDoneTracker(props.doneTracker);

  return (
    <ImperativeForkLeafDoneTracker doneTracker={doneTracker}>
      {(doneTracker) => (
        <>
          Type more than 2 characters:
          <input
            type={"text"}
            onChange={(e) => {
              if (e.target.value.length > 2) doneTracker.signalDone();
            }}
          />
        </>
      )}
    </ImperativeForkLeafDoneTracker>
  );
};

export default {
  title: 'Imperative API/Input',
  component: Input,
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
Primary.args = {};
