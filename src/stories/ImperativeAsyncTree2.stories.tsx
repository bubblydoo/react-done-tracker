import { action } from "@storybook/addon-actions";
import { Meta, StoryFn } from "@storybook/react";
import React, { useEffect, useState } from "react";
import { ImperativeDoneTrackedProps } from "../imperative-done-tracked";
import StoryWrapper from "./StoryWrapper";
import ImperativeDelayedContainer from "../components/ImperativeDelayedContainer";
import ImperativeDelayedComponent from "../components/ImperativeDelayedComponent";
import ImperativeButton from "../components/ImperativeButton";
import Image from "../components/ImperativeImage";
import { useImperativeNodeDoneTracker } from "../use-imperative-node-done-tracker";
import { useImperativeLeafDoneTracker } from "../use-imperative-leaf-done-tracker";
import { NodeDoneTracker } from "../node-done-tracker";
import { DoneTracker } from "../done-tracker-interface";
import { imperativeVisualizeDoneWrapper } from "../visualize-wrapper";
import { TrackComponentDoneProps } from "../track-component-done";

const DelayedContainer = imperativeVisualizeDoneWrapper(
  ImperativeDelayedContainer
);
const DelayedComponent = imperativeVisualizeDoneWrapper(
  ImperativeDelayedComponent
);
const Button = imperativeVisualizeDoneWrapper(ImperativeButton);

const status = (dt: DoneTracker) =>
  `${dt.name}:${dt.done ? "Done" : "Not done"}`;

const OrigContainerWithImageDelayingChildren = (
  props: ImperativeDoneTrackedProps<{
    delay: number;
    src: string;
    children?: (doneTracker: NodeDoneTracker) => any;
  }>
) => {
  console.log("delayed component", props.doneTracker.id);
  const nodeDoneTracker = useImperativeNodeDoneTracker(props.doneTracker);
  const localDoneTracker = useImperativeLeafDoneTracker(nodeDoneTracker, {
    name: "Local",
  });
  const imageDoneTracker = useImperativeNodeDoneTracker(nodeDoneTracker, {
    name: "Image",
  });
  const childrenDoneTracker = useImperativeNodeDoneTracker(nodeDoneTracker, {
    name: "Children",
  });
  const [delaying, setDelaying] = useState(true);

  console.log("Rerendering component", localDoneTracker?.id);

  useEffect(() => {
    if (!localDoneTracker) return;
    console.log("scheduling component delay", performance.now());
    const timeoutId = setTimeout(() => {
      localDoneTracker.signalDone();
      setDelaying(false);
    }, props.delay);
    return () => clearTimeout(timeoutId);
  }, [localDoneTracker, props.delay]);

  useEffect(() => setDelaying(true), [localDoneTracker]);

  const childrenComponents = props.children?.(childrenDoneTracker);

  return (
    <div>
      {status(localDoneTracker)} & {status(imageDoneTracker)} &{" "}
      {status(childrenDoneTracker)}
      <Image src={props.src} doneTracker={imageDoneTracker} />
      {delaying ? "Delaying" : "Done"} {childrenComponents}
    </div>
  );
};

const ContainerWithImageDelayingChildren = imperativeVisualizeDoneWrapper(
  OrigContainerWithImageDelayingChildren,
  "ContainerWithImageDelayingChildren"
);

const Tree = (props: { doneTracker: NodeDoneTracker; imageSrc: string }) => {
  const localDoneTracker = useImperativeNodeDoneTracker(props.doneTracker);

  return (
    <>
      <ContainerWithImageDelayingChildren
        doneTracker={localDoneTracker}
        delay={3000}
        src={props.imageSrc}
      >
        {(doneTracker) => (
          <DelayedComponent
            doneTracker={doneTracker}
            delay={200}
          ></DelayedComponent>
        )}
      </ContainerWithImageDelayingChildren>
      <DelayedContainer delay={1000} doneTracker={localDoneTracker}>
        {(doneTracker) => (
          <div>
            <Button doneTracker={doneTracker}>Click to make done</Button>
          </div>
        )}
      </DelayedContainer>
      <Button doneTracker={localDoneTracker} persistDone={true}>
        {"Click to make done (persisted)"}
      </Button>
    </>
  );
};

export default {
  title: "Imperative API/Async tree 2",
  component: Tree,
  args: {
    onDone: action("done"),
    onAbort: action("abort"),
    onError: action("error"),
    onPending: action("pending"),
  },
} as Meta;

const Template: StoryFn<TrackComponentDoneProps> = (args, { component }) => (
  <StoryWrapper
    {...args}
    component={component!}
    imperative={true}
  />
);

export const Primary = Template.bind({});
Primary.args = {
  imageSrc: "https://picsum.photos/200/100",
};
