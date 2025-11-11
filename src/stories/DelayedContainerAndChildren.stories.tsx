import React from "react";
import { action } from "storybook/actions";
import {
  ContextualStoryDecorator,
  RunBeforeRenderDecorator,
} from "./StoryWrapper";
import ImperativeDelayedComponent from "../components/ImperativeDelayedComponent";
import ImperativeDelayedContainer from "../components/ImperativeDelayedContainer";
import { imperativeToContextual } from "../imperative-to-contextual";
import { visualizeDoneWrapper } from "../visualize-wrapper";
import { Meta } from "@storybook/react-vite";
import { createSpyableActions, delay, doneTrackerUtils } from "./common";
import { expect } from "storybook/test";
import { within } from "storybook/test";

const DelayedComponent = imperativeToContextual(ImperativeDelayedComponent);
const DelayedContainer = imperativeToContextual(ImperativeDelayedContainer);

const VisualizedDelayedContainer = visualizeDoneWrapper(DelayedContainer);
const VisualizedDelayedComponent = visualizeDoneWrapper(DelayedComponent);

const { actions, actionsMockClear } = createSpyableActions({
  onDone: action("done"),
  onAbort: action("abort"),
  onError: action("error"),
  onPending: action("pending"),
});

export default {
  title: "Tests/Delayed Container And Children",
  component: DelayedContainer,
  decorators: [
    ContextualStoryDecorator(actions),
    RunBeforeRenderDecorator(actionsMockClear),
  ],
};

export const Primary = {
  args: {
    children: (
      <>
        <VisualizedDelayedContainer delay={1000}>
          <VisualizedDelayedComponent delay={2000} />
          <VisualizedDelayedComponent delay={3000} />
        </VisualizedDelayedContainer>
        <VisualizedDelayedContainer delay={3000}>
          <VisualizedDelayedComponent delay={3000} />
          <VisualizedDelayedComponent delay={4000} />
        </VisualizedDelayedContainer>
      </>
    ),
  },
};

export const InteractionTest: Meta = {
  args: {
    children: (
      <>
        <VisualizedDelayedContainer delay={500}>
          <VisualizedDelayedComponent delay={500} />
          <VisualizedDelayedComponent delay={800} />
        </VisualizedDelayedContainer>
        <VisualizedDelayedContainer delay={800}>
          <VisualizedDelayedComponent delay={500} />
          <VisualizedDelayedComponent delay={800} />
        </VisualizedDelayedContainer>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const { status } = await doneTrackerUtils(canvas);
    expect(status()).toBe("pending");
    await delay(2000);
    expect(status()).toBe("done");
    expect(actions.onDone).toHaveBeenCalledTimes(1);
  },
};
