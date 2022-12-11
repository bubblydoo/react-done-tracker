import { action } from "@storybook/addon-actions";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import StoryWrapper from "./story-wrapper";
import OrigDelayedContainer from "../components/DelayedContainer";
import OrigButton from "../components/Button";
import visualizeDoneWrapper from "../visualize-wrapper";
import OrigForkDoneTracker from "../components/ForkLeafDoneTracker";
import { useNodeDoneTracker } from "../use-node-done-tracker";
import { NodeDoneTracker } from "../node-done-tracker";

const DelayedContainer = visualizeDoneWrapper(OrigDelayedContainer);
const Button = visualizeDoneWrapper(OrigButton);
const ForkDoneTracker = visualizeDoneWrapper(OrigForkDoneTracker);

const Tree = (props: { doneTracker: NodeDoneTracker; imageSrc: string }) => {
  const doneTracker = useNodeDoneTracker(props.doneTracker);

  return (
    <>
      <DelayedContainer delay={1000} doneTracker={doneTracker}>
        {(doneTracker) => (
          <div>
            <Button doneTracker={doneTracker}>Click to make done</Button>
          </div>
        )}
      </DelayedContainer>
      <ForkDoneTracker doneTracker={doneTracker}>
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
      </ForkDoneTracker>
    </>
  );
};

export default {
  component: Tree,
  args: {
    onDone: action("done"),
    onAbort: action("abort"),
    onError: action("error"),
    onPending: action("pending"),
  },
} as Meta;

const Template: StoryFn = (args, { component }) => (
  <StoryWrapper {...args} showForceRefresh={true} component={component} />
);

export const Primary = Template.bind({});
Primary.args = {};
