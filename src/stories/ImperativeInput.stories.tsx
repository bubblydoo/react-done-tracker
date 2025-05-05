import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import React from "react";
import { ImperativeStoryDecorator } from "./StoryWrapper";
import OrigImperativeForkLeafDoneTracker from "../components/ImperativeForkLeafDoneTracker";
import { useImperativeNodeDoneTracker } from "../use-imperative-node-done-tracker";
import { NodeDoneTracker } from "../node-done-tracker";
import { imperativeVisualizeDoneWrapper } from "../visualize-wrapper";

const ImperativeForkLeafDoneTracker = imperativeVisualizeDoneWrapper(
  OrigImperativeForkLeafDoneTracker,
);

const Input = (props: { doneTracker: NodeDoneTracker }) => {
  const doneTracker = useImperativeNodeDoneTracker(props.doneTracker);

  return (
    <ImperativeForkLeafDoneTracker doneTracker={doneTracker}>
      {(doneTracker) => (
        <>
          Type more than 2 characters:
          <input
            type={"text"}
            onChange={(e) => {
              if (e.target.value.length > 2) doneTracker.signalDone();
            }}
          />
        </>
      )}
    </ImperativeForkLeafDoneTracker>
  );
};

export default {
  title: "Imperative API/Input",
  component: Input,
  decorators: [
    ImperativeStoryDecorator({
      onDone: action("done"),
      onAbort: action("abort"),
      onError: action("error"),
      onPending: action("pending"),
      onChange: action("change"),
    }),
  ],
} as Meta;

export const Primary = { args: {} };
