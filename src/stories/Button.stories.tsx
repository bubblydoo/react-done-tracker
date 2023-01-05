import type { Meta } from "@storybook/react";
import { within, fireEvent } from "@storybook/testing-library";
import { expect } from "@storybook/jest";
import Button from "../components/Button";
import { ContextualStoryDecorator } from "./StoryWrapper";
import { createSpyableActions, delay, doneTrackerUtils } from "./common";
import { action } from "@storybook/addon-actions";

const { actions, actionsMockClear } = createSpyableActions({
  onDone: action("done"),
  onAbort: action("abort"),
  onError: action("error"),
  onPending: action("pending"),
});

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
    await delay(500);

    const canvas = within(canvasElement);
    const { status, refresh } = await doneTrackerUtils(canvas);
    actionsMockClear();

    const button = canvas.getByText("Click me", { selector: "button" });
    fireEvent.click(button);
    expect(status()).toBe("pending");
    await Promise.resolve();
    // it is resolved in 1 microtask
    expect(status()).toBe("done");
    refresh();
    await Promise.resolve();
    expect(status()).toBe("pending");
    fireEvent.click(button);
    expect(status()).toBe("pending");
    await Promise.resolve();
    expect(status()).toBe("done");
  },
};

export const InteractionTestPersisted: Meta = {
  args: { children: "Click me", persistDone: true },
  play: async ({ canvasElement }) => {
    await delay(500);

    const canvas = within(canvasElement);
    const { status, refresh } = await doneTrackerUtils(canvas);
    actionsMockClear();

    const button = canvas.getByText("Click me", { selector: "button" });
    fireEvent.click(button);
    expect(status()).toBe("pending");
    await Promise.resolve();
    // it is resolved in 1 microtask
    expect(status()).toBe("done");
    expect(actions.onDone).toBeCalledTimes(1);
    actions.onDone.mockReset();
    refresh();
    await Promise.resolve();
    expect(status()).toBe("done");
    expect(actions.onPending).not.toBeCalled();
    expect(actions.onDone).toBeCalledTimes(1);
  },
};
