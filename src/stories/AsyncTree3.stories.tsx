import { action } from "@storybook/addon-actions";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { DoneTracker } from "../done-tracker";
import { useDoneTrackerRaw } from "../use-done-tracker-raw";
import StoryWrapper from "./story-wrapper";
import OrigDelayedContainer from "../components/DelayedContainer";
import OrigButton from "../components/Button";
import visualizeDoneWrapper from "../visualize-wrapper";
import OrigForkDoneTracker from "../components/ForkDoneTracker";

const DelayedContainer = visualizeDoneWrapper(OrigDelayedContainer);
const Button = visualizeDoneWrapper(OrigButton);
const ForkDoneTracker = visualizeDoneWrapper(OrigForkDoneTracker);

const Tree = (props: { doneTracker: DoneTracker; imageSrc: string }) => {
  const doneTracker = useDoneTrackerRaw(props.doneTracker);

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
          <input
            placeholder="Type more than 3 characters"
            onChange={(e) => {
              if (e.target.value.length > 2) doneTracker.signalDone();
            }}
          />
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
