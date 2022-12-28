import { action } from "@storybook/addon-actions";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import OrigDelayedContainer from "../components/ImperativeDelayedContainer";
import OrigDelayedComponent from "../components/ImperativeDelayedComponent";
import StoryWrapper from "./StoryWrapper";
import { imperativeVisualizeDoneWrapper } from "../visualize-wrapper";
import ImperativeDoneVisualizer from "../components/ImperativeDoneVisualizer";
import { useImperativeNodeDoneTracker } from "../use-imperative-node-done-tracker";
import { NodeDoneTracker } from "../node-done-tracker";
import { TrackComponentDoneProps } from "../track-component-done";

const DelayedContainer = imperativeVisualizeDoneWrapper(OrigDelayedContainer);
const DelayedComponent = imperativeVisualizeDoneWrapper(OrigDelayedComponent);

const Tree = (props: { doneTracker: NodeDoneTracker }) => {
  const doneTracker = useImperativeNodeDoneTracker(props.doneTracker);

  return (
    <ImperativeDoneVisualizer doneTracker={doneTracker} name={"Root"}>
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
        </>
      )}
    </ImperativeDoneVisualizer>
  );
};

export default {
  title: 'Imperative API/Simple async tree',
  component: Tree,
  args: {
    onDone: action("done"),
    onAbort: action("abort"),
    onError: action("error"),
    onPending: action("pending"),
  },
} as Meta;

const Template: StoryFn<TrackComponentDoneProps> = (args, { component }) => (
  <StoryWrapper {...args} showForceRefresh={true} component={component!} imperative={true} />
);

export const Primary = Template.bind({});
Primary.args = {};
