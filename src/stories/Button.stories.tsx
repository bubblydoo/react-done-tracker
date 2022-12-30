import type { Meta } from "@storybook/react";
import { within, fireEvent } from "@storybook/testing-library";
import { expect } from "@storybook/jest";
import Button from "../components/Button";
import { ContextualStoryDecorator } from "./StoryWrapper";
import { createSpyableActions } from "./common";

const { actions, actionsMockReset } = createSpyableActions();

export default {
  title: "Contextual API/Button",
  component: Button,
  decorators: [ContextualStoryDecorator(actions)],
} as Meta;

export const Primary: Meta = {
  args: { children: "Click me", persistDone: false },
};

export const InteractionTestNotPersisted: Meta = {
  args: { children: "Click me", persistDone: false },
  play: async ({ canvasElement }) => {
    await Promise.resolve();

    actionsMockReset();

    const canvas = within(canvasElement);
    const button = canvas.getByText("Click me", { selector: "button" });
    fireEvent.click(button);
    const text = canvas.getByTestId("root-state");
    expect(text.innerText).toBe("pending");
    await Promise.resolve();
    // it is resolved in 1 microtask
    expect(text.innerText).toBe("done");
    const refreshButton = canvas.getByTestId("new-root-done-tracker");
    fireEvent.click(refreshButton);
    await Promise.resolve();
    expect(text.innerText).toBe("pending");
    fireEvent.click(button);
    expect(text.innerText).toBe("pending");
    await Promise.resolve();
    expect(text.innerText).toBe("done");
  },
};

export const InteractionTestPersisted: Meta = {
  args: { children: "Click me", persistDone: true },
  play: async ({ canvasElement }) => {
    await Promise.resolve();

    actionsMockReset();

    const canvas = within(canvasElement);
    const text = await canvas.findByTestId("root-state");
    const refreshButton = await canvas.findByTestId("new-root-done-tracker");

    const button = canvas.getByText("Click me", { selector: "button" });
    fireEvent.click(button);
    expect(text.innerText).toBe("pending");
    await Promise.resolve();
    // it is resolved in 1 microtask
    expect(text.innerText).toBe("done");
    expect(actions.onDone).toBeCalledTimes(1);
    actions.onDone.mockReset();
    fireEvent.click(refreshButton);
    await Promise.resolve();
    expect(text.innerText).toBe("done");
    expect(actions.onPending).not.toBeCalled();
    expect(actions.onDone).toBeCalledTimes(1);
  },
};
