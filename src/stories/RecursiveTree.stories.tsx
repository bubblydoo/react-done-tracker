import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import React, { useState } from "react";
import OrigImperativeForkNodeDoneTracker from "../components/ImperativeForkNodeDoneTracker";
import { ForkLeafDoneTracker } from "../components/ForkLeafDoneTracker";
import { imperativeToContextual } from "../imperative-to-contextual";
import { imperativeVisualizeDoneWrapper } from "../visualize-wrapper";
import { ContextualStoryDecorator } from "./StoryWrapper";

const ForkNodeDoneTracker = imperativeToContextual(
  imperativeVisualizeDoneWrapper(OrigImperativeForkNodeDoneTracker),
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
            <button onClick={() => doneTracker.reset()}>🔄 Reset</button>
          </>
        )}
      </ForkLeafDoneTracker>
    );
  const els = new Array(props.count).fill(0).map((x, i) => {
    return (
      <ForkNodeDoneTracker key={i} name={`FDT ${props.depth}#${i}`}>
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

export default {
  title: "Contextual API/Recursive tree",
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
