import { action } from "storybook/actions";
import { Meta } from "@storybook/react-vite";
import React from "react";
import ImperativeDelayedContainer from "../components/ImperativeDelayedContainer";
import ImperativeDelayedComponent from "../components/ImperativeDelayedComponent";
import ImperativeDoneVisualizer from "../components/ImperativeDoneVisualizer";
import { imperativeToContextual } from "../imperative-to-contextual";
import { imperativeVisualizeDoneWrapper } from "../visualize-wrapper";
import { ContextualStoryDecorator } from "./StoryWrapper";

const DoneVisualizer = imperativeToContextual(ImperativeDoneVisualizer);
const DelayedContainer = imperativeToContextual(
  imperativeVisualizeDoneWrapper(
    ImperativeDelayedContainer,
    "DelayedContainer",
  ),
);
const DelayedComponent = imperativeToContextual(
  imperativeVisualizeDoneWrapper(
    ImperativeDelayedComponent,
    "DelayedComponent",
  ),
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

export default {
  title: "Contextual API/Simple async tree",
  component: Tree,
  decorators: [
    ContextualStoryDecorator({
      onDone: action("done"),
      onAbort: action("abort"),
      onError: action("error"),
      onPending: action("pending"),
    }),
  ],
} as Meta;

export const Primary = { args: {} };
