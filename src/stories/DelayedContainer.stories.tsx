import React from "react";
import { action } from "@storybook/addon-actions";
import { ContextualStoryDecorator } from "./StoryWrapper";
import DelayedContainer from "../components/DelayedContainer";
import ImperativeDelayedComponent from "../components/ImperativeDelayedComponent";
import { imperativeToContextual } from "../imperative-to-contextual";

const DelayedComponent = imperativeToContextual(ImperativeDelayedComponent);

export default {
  title: "Contextual API/Delayed Container",
  component: DelayedContainer,
  decorators: [
    ContextualStoryDecorator({
      onDone: action("done"),
      onAbort: action("abort"),
      onError: action("error"),
      onPending: action("pending"),
      onChange: action("change"),
    }),
  ],
};

export const Primary = {
  args: {
    delay: 3000,
    children: (
      <>
        Children:
        <DelayedComponent delay={3000}></DelayedComponent>
      </>
    ),
  },
};
