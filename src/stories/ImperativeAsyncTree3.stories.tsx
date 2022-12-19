import { action } from "@storybook/addon-actions";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import StoryWrapper from "./story-wrapper";
import ImperativeDelayedContainer from "../components/ImperativeDelayedContainer";
import ImperativeButton from "../components/ImperativeButton";
import OrigImperativeForkDoneTracker from "../components/ImperativeForkLeafDoneTracker";
import { useImperativeNodeDoneTracker } from "../use-imperative-node-done-tracker";
import { NodeDoneTracker } from "../node-done-tracker";
import { imperativeVisualizeDoneWrapper } from "../visualize-wrapper";

const DelayedContainer = imperativeVisualizeDoneWrapper(ImperativeDelayedContainer);
const Button = imperativeVisualizeDoneWrapper(ImperativeButton);
const ImperativeForkDoneTracker = imperativeVisualizeDoneWrapper(
  OrigImperativeForkDoneTracker,
);

const Tree = (props: { doneTracker: NodeDoneTracker; imageSrc: string }) => {
  const doneTracker = useImperativeNodeDoneTracker(props.doneTracker);

  return (
    <>
      <DelayedContainer delay={1000} doneTracker={doneTracker}>
        {(doneTracker) => (
          <div>
            <Button doneTracker={doneTracker}>Click to make done</Button>
          </div>
        )}
      </DelayedContainer>
      <ImperativeForkDoneTracker doneTracker={doneTracker}>
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
      </ImperativeForkDoneTracker>
    </>
  );
};

export default {
  title: "Imperative API/Async tree 3",
  component: Tree,
  args: {
    onDone: action("done"),
    onAbort: action("abort"),
    onError: action("error"),
    onPending: action("pending"),
  },
} as Meta;

const Template: StoryFn = (args, { component }) => (
  <StoryWrapper
    {...args}
    showForceRefresh={true}
    component={component}
    imperative={true}
  />
);

export const Primary = Template.bind({});
Primary.args = {};
