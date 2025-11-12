import { action } from "storybook/actions";
import { Meta } from "@storybook/react-vite";
import React from "react";
import ImperativeDoneVisualizer from "../components/ImperativeDoneVisualizer";
import ImperativeDelayedComponent from "../components/ImperativeDelayedComponent";
import { imperativeToContextual } from "../imperative-to-contextual";
import { visualizeDoneWrapper } from "../visualize-wrapper";
import { ContextualStoryDecorator } from "./StoryWrapper";
import { TrackDone } from "../components/TrackDone";

const DoneVisualizer = imperativeToContextual(ImperativeDoneVisualizer);
const DelayedComponent = visualizeDoneWrapper(
  imperativeToContextual(ImperativeDelayedComponent),
);

const Tree = () => {
  return (
    <DoneVisualizer name={"Root"}>
      <TrackDone>
        <DoneVisualizer name={"Sub 1"}>
          <DelayedComponent delay={2000} />
        </DoneVisualizer>
        <TrackDone>
          <DoneVisualizer name={"Sub 2"}>
            <DelayedComponent delay={1000} />
          </DoneVisualizer>
        </TrackDone>
      </TrackDone>
    </DoneVisualizer>
  );
};

export default {
  title: "Contextual API/Nested Track Done",
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
