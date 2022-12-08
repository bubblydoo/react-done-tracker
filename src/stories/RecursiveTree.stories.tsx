import { action } from "@storybook/addon-actions";
import { Meta, StoryFn } from "@storybook/react";
import React, { useState } from "react";
import { DoneTracker } from "../done-tracker";
import { useDoneTrackerRaw } from "../use-done-tracker-raw";
import StoryWrapper from "./story-wrapper";
import visualizeDoneWrapper from "../visualize-wrapper";
import OrigForkDoneTracker from "../components/ForkDoneTracker";

const ForkDoneTracker = visualizeDoneWrapper(OrigForkDoneTracker);

function RecursiveElement(props: {
  count: number;
  depth: number;
  children: any;
  doneTracker: DoneTracker;
}) {
  if (props.depth <= 0)
    return <button onClick={() => props.doneTracker.signalDone()}>Done</button>;
  const els = new Array(props.count).fill(0).map((x, i) => {
    return (
      <ForkDoneTracker
        key={i}
        doneTracker={props.doneTracker}
        willBeSignaledDone={props.depth === 1}
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
      </ForkDoneTracker>
    );
  });
  return <div>{els}</div>;
}

const Tree = (props: { doneTracker: DoneTracker; imageSrc: string }) => {
  const doneTracker = useDoneTrackerRaw(props.doneTracker);

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
