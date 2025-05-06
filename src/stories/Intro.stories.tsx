import { action } from "@storybook/addon-actions";

import Image from "../components/Image";
import Button from "../components/Button";
import ImperativeButton from "../components/ImperativeButton";
import StoryWrapper, {
  ContextualStoryDecorator,
  ImperativeStoryDecorator,
} from "./StoryWrapper";
import ImperativeDelayedComponent from "../components/ImperativeDelayedComponent";
import ImperativeDelayedContainer from "../components/ImperativeDelayedContainer";
import ImperativeDoneVisualizer from "../components/ImperativeDoneVisualizer";
import { ForkLeafDoneTracker } from "../components/ForkLeafDoneTracker";
import { imperativeToContextual } from "../imperative-to-contextual";
import { visualizeDoneWrapper } from "../visualize-wrapper";
import React from "react";
import { NodeDoneTracker } from "../node-done-tracker";

const DelayedComponent = imperativeToContextual(ImperativeDelayedComponent, {
  displayName: "DelayedComponent",
});

const DelayedContainer = imperativeToContextual(ImperativeDelayedContainer, {
  displayName: "DelayedContainer",
});

const actions = {
  onDone: action("done"),
  onAbort: action("abort"),
  onError: action("error"),
  onPending: action("pending"),
  onChange: action("change"),
};

const VisualizedDelayedComponent = visualizeDoneWrapper(DelayedComponent);

const VisualizedDelayedContainer = visualizeDoneWrapper(DelayedContainer);

const DoneVisualizer = imperativeToContextual(ImperativeDoneVisualizer, {
  displayName: "DoneVisualizer",
});

export default {
  title: "Intro",
};

export const ImageStory = {
  render: () => <Image src={"https://picsum.photos/200"} />,
  name: "Image",
  decorators: [ContextualStoryDecorator(actions)],
};

export const DelayedComponentStory = {
  render: () => <DelayedComponent delay={3000} />,
  name: "Delayed Component",
  decorators: [ContextualStoryDecorator(actions)],
};

export const MultipleDelayedComponents = {
  render: () => (
    <>
      <DelayedComponent delay={3000} />
      <DelayedComponent delay={4000} />
      <DelayedComponent delay={5000} />
    </>
  ),
  name: "Multiple Delayed Components",
  decorators: [ContextualStoryDecorator(actions)],
};

export const VisualizedMultipleDelayedComponents = {
  render: () => (
    <>
      <VisualizedDelayedComponent delay={3000} />
      <VisualizedDelayedComponent delay={4000} />
      <VisualizedDelayedComponent delay={5000} />
    </>
  ),
  name: "Visualized Multiple Delayed Components",
  decorators: [ContextualStoryDecorator(actions)],
};

export const ContainerAndChildren = {
  render: () => (
    <>
      <VisualizedDelayedContainer delay={3000}>
        <VisualizedDelayedComponent delay={3000} />
        <VisualizedDelayedComponent delay={4000} />
      </VisualizedDelayedContainer>
      <VisualizedDelayedContainer delay={5000}>
        <VisualizedDelayedComponent delay={3000} />
        <VisualizedDelayedComponent delay={4000} />
      </VisualizedDelayedContainer>
    </>
  ),
  name: "Container and children",
  decorators: [ContextualStoryDecorator(actions)],
};

export const ImageError = {
  render: () => <Image src={"https://example.qwkeinasc"} />,
  name: "Image error",
  decorators: [ContextualStoryDecorator(actions)],
};

export const ErrorInATree = {
  render: () => (
    <>
      <DoneVisualizer>
        <Image src={"https://example.qwkeinasc"} />
        <Image src={"https://picsum.photos/100/100"} />
      </DoneVisualizer>
      <DoneVisualizer>
        <Image src={"https://picsum.photos/101/100"} />
        <Image src={"https://picsum.photos/102/100"} />
      </DoneVisualizer>
    </>
  ),
  name: "Error in a tree",
  decorators: [ContextualStoryDecorator(actions)],
};

export const ContextualButton = {
  render: () => <Button>✅ Done</Button>,
  name: "Contextual button",
  decorators: [ContextualStoryDecorator(actions)],
};

export const ImperativeButtonStory = {
  render: ({ doneTracker }: { doneTracker: NodeDoneTracker }) => (
    <ImperativeButton doneTracker={doneTracker}>✅ Done</ImperativeButton>
  ),
  name: "Imperative button",
  decorators: [ImperativeStoryDecorator(actions)],
};

export const ForkedButtons = {
  render: () => (
    <DoneVisualizer>
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
    </DoneVisualizer>
  ),
  name: "Forked buttons",
  decorators: [ContextualStoryDecorator(actions)],
};
