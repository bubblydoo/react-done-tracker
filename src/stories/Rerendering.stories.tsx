import { action } from "storybook/actions";
import { Meta, StoryObj } from "@storybook/react-vite";
import { ContextualStoryDecorator } from "./StoryWrapper";
import React from "react";
import ImperativeDelayedComponent from "../components/ImperativeDelayedComponent";
import { imperativeVisualizeDoneWrapper } from "../visualize-wrapper";
import { imperativeToContextual } from "../imperative-to-contextual";
import { within, expect } from "storybook/test";
import { useNodeDoneTracker } from "../use-node-done-tracker";
import { DoneTrackerProvider } from "../done-tracker-provider";
import { delay } from "./common";

const DelayedComponent = imperativeToContextual(
  imperativeVisualizeDoneWrapper(ImperativeDelayedComponent, "DelayedComponent")
);

function Status({ children }: { children: React.ReactNode }) {
  const doneTracker = useNodeDoneTracker({
    name: "Status",
  });

  return (
    <div>
      <div>
        Status:{" "}
        <input
          data-testid="status"
          readOnly
          value={doneTracker.done ? "Done" : "Not done"}
        />
      </div>
      <DoneTrackerProvider doneTracker={doneTracker}>
        {children}
      </DoneTrackerProvider>
    </div>
  );
}

// regression test for https://github.com/bubblydoo/react-done-tracker/commit/c63980cbf903ce7b7e8a7879b4717025e175567a
export default {
  title: "Tests/Rerendering",
  component: () => (
    <Status>
      <DelayedComponent delay={1000} />
    </Status>
  ),
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

export const Primary = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId("status");
    console.log("input", input);
    await delay(1500);
    expect(input).toHaveValue("Done");
  },
} satisfies StoryObj<typeof DelayedComponent>;
