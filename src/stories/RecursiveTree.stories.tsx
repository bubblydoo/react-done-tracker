import { action } from "@storybook/addon-actions";
import { Meta, StoryFn } from "@storybook/react";
import React, { useState } from "react";
import StoryWrapper from "./story-wrapper";
import visualizeDoneWrapper from "../visualize-wrapper";
import OrigForkNodeDoneTracker from "../components/ForkNodeDoneTracker";
import { NodeDoneTracker } from "../node-done-tracker";
import OrigForkLeafDoneTracker from "../components/ForkLeafDoneTracker";
import { useNodeDoneTracker } from "../use-node-done-tracker";

const ForkNodeDoneTracker = visualizeDoneWrapper(OrigForkNodeDoneTracker);
const ForkLeafDoneTracker = visualizeDoneWrapper(OrigForkLeafDoneTracker);

function RecursiveElement(props: {
  count: number;
  depth: number;
  children: any;
  doneTracker: NodeDoneTracker;
}) {
  if (props.depth <= 0)
    return (
      <ForkLeafDoneTracker doneTracker={props.doneTracker}>
        {(doneTracker) => (
          <button onClick={() => doneTracker.signalDone()}>Done</button>
        )}
      </ForkLeafDoneTracker>
    );
  const els = new Array(props.count).fill(0).map((x, i) => {
    return (
      <ForkNodeDoneTracker
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
      </ForkNodeDoneTracker>
    );
  });
  return <div>{els}</div>;
}

const Tree = (props: { doneTracker: NodeDoneTracker; imageSrc: string }) => {
  const doneTracker = useNodeDoneTracker(props.doneTracker);

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
  component: Tree,
  args: {
    onDone: action("done"),
    onAbort: action("abort"),
    onError: action("error"),
    onPending: action("pending"),
  },
} as Meta;

const Template: StoryFn = (args, { component }) => (
  <StoryWrapper {...args} showForceRefresh={true} component={component} />
);

export const Primary = Template.bind({});
Primary.args = {};
