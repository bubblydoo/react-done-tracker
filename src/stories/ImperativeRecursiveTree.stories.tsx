import { action } from "@storybook/addon-actions";
import { Meta, StoryFn } from "@storybook/react";
import React, { useState } from "react";
import StoryWrapper from "./story-wrapper";
import OrigImperativeForkNodeDoneTracker from "../components/ImperativeForkNodeDoneTracker";
import { NodeDoneTracker } from "../node-done-tracker";
import OrigImperativeForkLeafDoneTracker from "../components/ImperativeForkLeafDoneTracker";
import { useImperativeNodeDoneTracker } from "../use-imperative-node-done-tracker";
import { imperativeVisualizeDoneWrapper } from "../visualize-wrapper";

const ImperativeForkNodeDoneTracker = imperativeVisualizeDoneWrapper(OrigImperativeForkNodeDoneTracker);
const ImperativeForkLeafDoneTracker = imperativeVisualizeDoneWrapper(OrigImperativeForkLeafDoneTracker);

function RecursiveElement(props: {
  count: number;
  depth: number;
  children: any;
  doneTracker: NodeDoneTracker;
}) {
  if (props.depth <= 0)
    return (
      <ImperativeForkLeafDoneTracker doneTracker={props.doneTracker}>
        {(doneTracker) => (
          <>
            <button onClick={() => doneTracker.signalDone()}>✅ Done</button>
            <button onClick={() => doneTracker.signalError('error')}>❌ Error</button>
          </>
        )}
      </ImperativeForkLeafDoneTracker>
    );
  const els = new Array(props.count).fill(0).map((x, i) => {
    return (
      <ImperativeForkNodeDoneTracker
        key={i}
        doneTracker={props.doneTracker}
        willHaveChildren={props.depth > 1}
        name={`FDT ${props.depth}#${i}`}
      >
        {(doneTracker) => (
          <div style={{ marginLeft: 8 }}>
            <RecursiveElement
              count={props.count}
              depth={props.depth - 1}
              doneTracker={doneTracker}
            >
              {props.children}
            </RecursiveElement>
          </div>
        )}
      </ImperativeForkNodeDoneTracker>
    );
  });
  return <div>{els}</div>;
}

const Tree = (props: { doneTracker: NodeDoneTracker; imageSrc: string }) => {
  const doneTracker = useImperativeNodeDoneTracker(props.doneTracker);

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
      <RecursiveElement count={count} depth={depth} doneTracker={doneTracker}>
        hi
      </RecursiveElement>
    </>
  );
};

export default {
  title: 'Imperative API/Recursive tree',
  component: Tree,
  args: {
    onDone: action("done"),
    onAbort: action("abort"),
    onError: action("error"),
    onPending: action("pending"),
  },
} as Meta;

const Template: StoryFn = (args, { component }) => (
  <StoryWrapper {...args} showForceRefresh={true} component={component} imperative={true} />
);

export const Primary = Template.bind({});
Primary.args = {};
