/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { Meta } from "@storybook/react";
import { waitFor, within } from "@storybook/testing-library";
import { expect } from "@storybook/jest";
import Image from "../components/Image";
import { createSpyableActions, delay, doneTrackerUtils } from "./common";
import {
  ContextualStoryDecorator,
  RunBeforeRenderDecorator,
} from "./StoryWrapper";
import { action } from "@storybook/addon-actions";

const { actions, actionsMockClear } = createSpyableActions({
  onDone: action("done"),
  onAbort: action("abort"),
  onError: action("error"),
  onPending: action("pending"),
});

export default {
  title: "Contextual API/Image",
  component: Image,
  decorators: [
    ContextualStoryDecorator(actions),
    RunBeforeRenderDecorator(actionsMockClear),
  ],
} as Meta;

export const Primary: Meta = {
  args: {
    src: "https://picsum.photos/200/300",
  },
};

export const InteractionTest: Meta = {
  args: {
    src: "https://picsum.photos/200/300",
  },
  play: async ({ canvasElement }) => {
    await delay(500);

    const canvas = within(canvasElement);
    const { status, refresh } = await doneTrackerUtils(canvas);

    await waitFor(() => expect(status()).toBe("done"), { timeout: 5000 });
    await delay(100);
    expect(actions.onDone).toBeCalled();
    actionsMockClear();
    refresh();
    await delay(100);
    expect(status()).toBe("done");
    expect(actions.onDone).toBeCalled();
  },
};

export const Error: Meta = {
  args: {
    src: "https://example.qwkeinasc",
  },
};

export const InteractionTestError: Meta = {
  args: {
    src: "https://example.qwkeinasc",
  },
  play: async ({ canvasElement }) => {
    await delay(500);

    const canvas = within(canvasElement);
    const { status, refresh } = await doneTrackerUtils(canvas);

    await waitFor(() => expect(status()).toBe("error"), { timeout: 5000 });
    refresh();
    await delay(100);
    expect(status()).toBe("error");
  },
};
