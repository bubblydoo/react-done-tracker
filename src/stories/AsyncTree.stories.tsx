import { action } from "@storybook/addon-actions";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import OrigDelayedContainer from "../components/DelayedContainer";
import OrigDelayedComponent from "../components/DelayedComponent";
import { DoneTracker } from "../done-tracker";
import { useDoneTracker } from "../done-tracker-hook";
import StoryWrapper from "./story-wrapper";
import visualizeDoneWrapper from "../visualize-wrapper";
import DoneVisualizer from "../components/DoneVisualizer";

const DelayedContainer = visualizeDoneWrapper(OrigDelayedContainer);
const DelayedComponent = visualizeDoneWrapper(OrigDelayedComponent);

const Tree1 = (props: { doneTracker: DoneTracker }) => {
  const doneTracker = useDoneTracker(props.doneTracker);

  return (
    <DoneVisualizer doneTracker={doneTracker} name={"Root"}>
      {(doneTracker) => (
        <>
          {doneTracker.id}
          <DelayedContainer doneTracker={doneTracker} delay={2000}>
            {(doneTracker) => (
              <DelayedComponent
                doneTracker={doneTracker}
                delay={2000}
              ></DelayedComponent>
            )}
          </DelayedContainer>
          <DelayedComponent
            doneTracker={doneTracker}
            delay={2000}
          ></DelayedComponent>
          <DelayedContainer doneTracker={doneTracker} delay={3000}>
            {(doneTracker) => (
              <DelayedContainer doneTracker={doneTracker} delay={2000}>
                {(doneTracker) => (
                  <DelayedComponent
                    doneTracker={doneTracker}
                    delay={2000}
                  ></DelayedComponent>
                )}
              </DelayedContainer>
            )}
          </DelayedContainer>
        </>
      )}
    </DoneVisualizer>
  );
};

export default {
  component: Tree1,
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
