import { action } from "storybook/actions";
import { Meta } from "@storybook/react-vite";
import React from "react";
import ImperativeDoneVisualizer from "../components/ImperativeDoneVisualizer";
import ImperativeDelayedComponent from "../components/ImperativeDelayedComponent";
import ImperativeDelayedContainer from "../components/ImperativeDelayedContainer";
import { imperativeToContextual } from "../imperative-to-contextual";
import { visualizeDoneWrapper } from "../visualize-wrapper";
import { ContextualStoryDecorator } from "./StoryWrapper";

const DoneVisualizer = imperativeToContextual(ImperativeDoneVisualizer);
const DelayedContainer = visualizeDoneWrapper(
  imperativeToContextual(ImperativeDelayedContainer),
);
const DelayedComponent = visualizeDoneWrapper(
  imperativeToContextual(ImperativeDelayedComponent),
);

const Tree = () => {
  return (
    <DoneVisualizer name={"Root"}>
      <DelayedContainer delay={2000}>
        <DelayedComponent delay={2000} />
      </DelayedContainer>
      <DelayedComponent delay={3000} />
      <DelayedContainer delay={2000}>
        <DelayedContainer delay={2000}>
          <DelayedComponent delay={2000} />
        </DelayedContainer>
      </DelayedContainer>
    </DoneVisualizer>
  );
};

export default {
  title: "Contextual API/Async tree",
  component: Tree,
  decorators: [
    ContextualStoryDecorator({
      onDone: action("done"),
      onAbort: action("abort"),
      onError: action("error"),
      onPending: action("pending"),
      onChange: action("change"),
    }),
  ],
} as Meta;

export const Primary = { args: {} };
