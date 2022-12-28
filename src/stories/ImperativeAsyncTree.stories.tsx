import { action } from "@storybook/addon-actions";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import ImperativeDelayedContainer from "../components/ImperativeDelayedContainer";
import ImperativeDelayedComponent from "../components/ImperativeDelayedComponent";
import StoryWrapper from "./StoryWrapper";
import ImperativeDoneVisualizer from "../components/ImperativeDoneVisualizer";
import { useImperativeNodeDoneTracker } from "../use-imperative-node-done-tracker";
import { NodeDoneTracker } from "../node-done-tracker";
import { imperativeVisualizeDoneWrapper } from "../visualize-wrapper";
import { TrackComponentDoneProps } from "../track-component-done";

const DelayedContainer = imperativeVisualizeDoneWrapper(ImperativeDelayedContainer);
const DelayedComponent = imperativeVisualizeDoneWrapper(ImperativeDelayedComponent);

const Tree = (props: { doneTracker: NodeDoneTracker }) => {
  const doneTracker = useImperativeNodeDoneTracker(props.doneTracker);

  return (
    <ImperativeDoneVisualizer doneTracker={doneTracker} name={"Root"}>
      {(doneTracker) => (
        <>
          {doneTracker.id}
          <DelayedContainer doneTracker={doneTracker} delay={2000}>
            {(doneTracker) => (
              <DelayedComponent doneTracker={doneTracker} delay={2000} />
            )}
          </DelayedContainer>
          <DelayedComponent doneTracker={doneTracker} delay={3000} />
          <DelayedContainer doneTracker={doneTracker} delay={2000}>
            {(doneTracker) => (
              <DelayedContainer doneTracker={doneTracker} delay={2000}>
                {(doneTracker) => (
                  <DelayedComponent doneTracker={doneTracker} delay={2000} />
                )}
              </DelayedContainer>
            )}
          </DelayedContainer>
        </>
      )}
    </ImperativeDoneVisualizer>
  );
};

export default {
  title: "Imperative API/Async tree",
  component: Tree,
  args: {
    onDone: action("done"),
    onAbort: action("abort"),
    onError: action("error"),
    onPending: action("pending"),
    fullscreen: true,
  },
} as Meta;

const Template: StoryFn<TrackComponentDoneProps> = (args, { component }) => (
  <StoryWrapper
    {...args}
    component={component!}
    imperative={true}
  />
);

export const Primary = Template.bind({});
Primary.args = {};
