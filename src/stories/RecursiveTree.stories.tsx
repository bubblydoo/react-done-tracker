import { action } from "@storybook/addon-actions";
import { Meta, StoryFn } from "@storybook/react";
import React, { useState } from "react";
import OrigImperativeForkNodeDoneTracker from "../components/ImperativeForkNodeDoneTracker";
import ForkLeafDoneTracker from "../components/ForkLeafDoneTracker";
import { imperativeToContextual } from "../imperative-to-contextual";
import { imperativeVisualizeDoneWrapper } from "../visualize-wrapper";
import { TrackComponentDoneProps } from "../track-component-done";
import { ContextualStoryHelper } from "./ContextualStoryWrapper";

const ForkNodeDoneTracker = imperativeToContextual(
  imperativeVisualizeDoneWrapper(OrigImperativeForkNodeDoneTracker)
);

function RecursiveElement(props: {
  count: number;
  depth: number;
  children: any;
}) {
  if (props.depth <= 0)
    return (
      <ForkLeafDoneTracker>
        {(doneTracker) => (
          <>
            <button onClick={() => doneTracker.signalDone()}>✅ Done</button>
            <button onClick={() => doneTracker.signalError("error")}>
              ❌ Error
            </button>
          </>
        )}
      </ForkLeafDoneTracker>
    );
  const els = new Array(props.count).fill(0).map((x, i) => {
    return (
      <ForkNodeDoneTracker
        key={i}
        willHaveChildren={props.depth > 1}
        name={`FDT ${props.depth}#${i}`}
      >
        <div style={{ marginLeft: 8 }}>
          <RecursiveElement count={props.count} depth={props.depth - 1}>
            {props.children}
          </RecursiveElement>
        </div>
      </ForkNodeDoneTracker>
    );
  });
  return <div>{els}</div>;
}

const Tree = () => {
  const [count, setCount] = useState(1);
  const [depth, setDepth] = useState(1);

  return (
    <>
      <label>
        Count:
        <input
          type="number"
          value={`${count}`}
          onChange={(e) => setCount(+e.target.value)}
        ></input>
      </label>
      <label>
        Depth:
        <input
          type="number"
          value={`${depth}`}
          onChange={(e) => setDepth(+e.target.value)}
        ></input>
      </label>
      <RecursiveElement count={count} depth={depth}>
        hi
      </RecursiveElement>
    </>
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
  title: "Contextual API/Recursive tree",
  component: Tree,
  args: {},
} as Meta;

const Template: StoryFn<TrackComponentDoneProps> = (args, { component }) => {
  return <ContextualStoryHelper {...helperArgs} args={args} component={component} />;
};

export const Primary = Template.bind({});
Primary.args = {};