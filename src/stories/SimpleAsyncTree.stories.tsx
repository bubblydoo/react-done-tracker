import { action } from "@storybook/addon-actions";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import ImperativeDelayedContainer from "../components/ImperativeDelayedContainer";
import ImperativeDelayedComponent from "../components/ImperativeDelayedComponent";
import ImperativeDoneVisualizer from "../components/ImperativeDoneVisualizer";
import { imperativeToContextual } from "../imperative-to-contextual";
import { imperativeVisualizeDoneWrapper } from "../visualize-wrapper";
import { TrackComponentDoneProps } from "../track-component-done";
import { ContextualStoryHelper } from "./ContextualStoryWrapper";

const DoneVisualizer = imperativeToContextual(ImperativeDoneVisualizer);
const DelayedContainer = imperativeToContextual(
  imperativeVisualizeDoneWrapper(ImperativeDelayedContainer, "DelayedContainer")
);
const DelayedComponent = imperativeToContextual(
  imperativeVisualizeDoneWrapper(ImperativeDelayedComponent, "DelayedComponent")
);

const Tree = () => {
  return (
    <DoneVisualizer name={"Root"}>
      <DelayedContainer delay={2000}>
        <DelayedComponent delay={2000}></DelayedComponent>
      </DelayedContainer>
    </DoneVisualizer>
  );
};

const helperArgs = {
  onDone: action("done"),
  onAbort: action("abort"),
  onError: action("error"),
  onPending: action("pending"),
  fullscreen: true,
};

export default {
  title: "Contextual API/Simple async tree",
  component: Tree,
  args: {},
} as Meta;

const Template: StoryFn<TrackComponentDoneProps> = (args, { component }) => {
  return <ContextualStoryHelper {...helperArgs} args={args} component={component} />;
};

export const Primary = Template.bind({});
Primary.args = {};