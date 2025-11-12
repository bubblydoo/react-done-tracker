import { action } from "storybook/actions";
import { Meta } from "@storybook/react-vite";
import React, { useState } from "react";
import OrigImperativeForkNodeDoneTracker from "../components/ImperativeForkNodeDoneTracker";
import { ForkLeafDoneTracker } from "../components/ForkLeafDoneTracker";
import { imperativeToContextual } from "../imperative-to-contextual";
import { imperativeVisualizeDoneWrapper } from "../visualize-wrapper";
import { ContextualStoryDecorator } from "./StoryWrapper";
import { createSpyableActions, delay, doneTrackerUtils } from "./common";
import { within } from "storybook/test";
import { expect } from "storybook/test";

const { actions, actionsMockClear } = createSpyableActions({
  onDone: action("done"),
  onAbort: action("abort"),
  onError: action("error"),
  onPending: action("pending"),
  onChange: action("change"),
});

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
            <button
              onClick={() => doneTracker.signalDone()}
              data-testid="done-button"
            >
              ✅ Done
            </button>
            <button
              onClick={() => doneTracker.signalError("error")}
              data-testid="error-button"
            >
              ❌ Error
            </button>
            <button
              onClick={() => doneTracker.reset()}
              data-testid="reset-button"
            >
              🔄 Reset
            </button>
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
  // const [count, setCount] = useState(1);
  // const [depth, setDepth] = useState(1);

  const count = 2;
  const depth = 3;

  return (
    <>
      <RecursiveElement count={count} depth={depth}>
        hi
      </RecursiveElement>
    </>
  );
};

export default {
  title: "Tests/Reset",
  component: Tree,
  decorators: [ContextualStoryDecorator(actions)],
  play: async ({ canvasElement }) => {
    await delay(500);

    const canvas = within(canvasElement);
    const { status } = await doneTrackerUtils(canvas);

    expect(status()).toBe("pending");
    expect(actions.onPending).toBeCalled();
    expect(actions.onDone).not.toBeCalled();

    for (let i = 0; i < 2; i++) {
      actionsMockClear();
      (await canvas.findAllByTestId("done-button")).forEach((e) => e.click());
      await delay(500);
      expect(status()).toBe("done");
      expect(actions.onDone).toBeCalledTimes(1);
      expect(actions.onPending).not.toBeCalled();

      actionsMockClear();
      (await canvas.findAllByTestId("reset-button")).forEach((e) => e.click());
      await delay(500);
      expect(status()).toBe("pending");
      expect(actions.onPending).toBeCalledTimes(1);
      expect(actions.onDone).not.toBeCalled();
    }
  },
} as Meta;

export const Primary = { args: {} };
