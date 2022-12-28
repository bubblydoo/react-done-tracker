import { action } from "@storybook/addon-actions";
import { Meta, StoryFn } from "@storybook/react";
import React, { useEffect, useState } from "react";
import ImperativeDelayedContainer from "../components/ImperativeDelayedContainer";
import ImperativeDelayedComponent from "../components/ImperativeDelayedComponent";
import ImperativeButton from "../components/ImperativeButton";
import { useImperativeNodeDoneTracker } from "../use-imperative-node-done-tracker";
import { useImperativeLeafDoneTracker } from "../use-imperative-leaf-done-tracker";
import { DoneTracker } from "../done-tracker-interface";
import { imperativeToContextual } from "../imperative-to-contextual";
import { useNodeDoneTracker } from "../use-node-done-tracker";
import {
  visualizeDoneWrapper,
  imperativeVisualizeDoneWrapper,
} from "../visualize-wrapper";
import Image from "../components/Image";
import DoneTrackerProvider from "../done-tracker-provider";
import { TrackComponentDoneProps } from "../track-component-done";
import { ContextualStoryHelper } from "./ContextualStoryWrapper";

const DelayedContainer = imperativeToContextual(
  imperativeVisualizeDoneWrapper(ImperativeDelayedContainer)
);
const DelayedComponent = imperativeToContextual(
  imperativeVisualizeDoneWrapper(ImperativeDelayedComponent)
);
const Button = imperativeToContextual(
  imperativeVisualizeDoneWrapper(ImperativeButton),
  true
);

const status = (dt: DoneTracker) =>
  `${dt.name}:${dt.done ? "Done" : "Not done"}`;

const OrigContainerWithImageDelayingChildren = (props: {
  delay: number;
  src: string;
  children?: any;
}) => {
  const doneTracker = useNodeDoneTracker({
    name: "ContainerWithImageDelayingChildren",
  });

  const [delaying, setDelaying] = useState(true);

  console.log("delayed component", doneTracker.id);
  const localDoneTracker = useImperativeLeafDoneTracker(doneTracker, {
    name: "Local",
    done: !delaying,
    reset: () => setDelaying(true),
  });
  const imageDoneTracker = useImperativeNodeDoneTracker(doneTracker, {
    name: "Image",
  });
  const childrenDoneTracker = useImperativeNodeDoneTracker(doneTracker, {
    name: "Children",
  });

  console.log("Rerendering component", localDoneTracker?.id);

  useEffect(() => {
    if (!localDoneTracker) return;
    console.log("scheduling component delay", performance.now());
    const timeoutId = setTimeout(() => {
      setDelaying(false);
    }, props.delay);
    return () => clearTimeout(timeoutId);
  }, [localDoneTracker, props.delay]);

  useEffect(() => setDelaying(true), [localDoneTracker]);

  return (
    <div>
      {status(localDoneTracker)} & {status(imageDoneTracker)} &{" "}
      {status(childrenDoneTracker)}
      <DoneTrackerProvider doneTracker={imageDoneTracker}>
        <Image src={props.src} />
      </DoneTrackerProvider>
      <DoneTrackerProvider doneTracker={childrenDoneTracker}>
        {delaying ? "Delaying" : "Done"} {props.children}
      </DoneTrackerProvider>
    </div>
  );
};

const ContainerWithImageDelayingChildren = visualizeDoneWrapper(
  OrigContainerWithImageDelayingChildren
);

const Tree = (props: { imageSrc: string }) => {
  return (
    <>
      <ContainerWithImageDelayingChildren delay={3000} src={props.imageSrc}>
        <DelayedComponent delay={200}></DelayedComponent>
      </ContainerWithImageDelayingChildren>
      <DelayedContainer delay={1000}>
        <Button>Click to make done</Button>
      </DelayedContainer>
      <Button persistDone={true}>{"Click to make done (persisted)"}</Button>
    </>
  );
};

export default {
  title: "Contextual API/Mixed Usage",
  component: Tree,
  args: {
    onDone: action("done"),
    onAbort: action("abort"),
    onError: action("error"),
    onPending: action("pending"),
    fullscreen: true,
  },
} as Meta;

const Template: StoryFn<TrackComponentDoneProps> = (args, { component }) => {
  return <ContextualStoryHelper args={args} component={component} />;
};

export const Primary = Template.bind({});
Primary.args = {
  imageSrc: "https://picsum.photos/200/100",
};
