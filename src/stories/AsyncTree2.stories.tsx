import { action } from "@storybook/addon-actions";
import { Meta, StoryFn } from "@storybook/react";
import React, { useEffect, useState } from "react";
import { DoneTrackedProps } from "../done-tracked";
import StoryWrapper from "./story-wrapper";
import OrigDelayedContainer from "../components/DelayedContainer";
import OrigDelayedComponent from "../components/DelayedComponent";
import OrigButton from "../components/Button";
import Image from "../components/Image";
import visualizeDoneWrapper from "../visualize-wrapper";
import { useNodeDoneTracker } from "../use-node-done-tracker";
import { useLeafDoneTracker } from "../use-leaf-done-tracker";
import { NodeDoneTracker } from "../node-done-tracker";
import { DoneTracker } from "../done-tracker-interface";

const DelayedContainer = visualizeDoneWrapper(OrigDelayedContainer);
const DelayedComponent = visualizeDoneWrapper(OrigDelayedComponent);
const Button = visualizeDoneWrapper(OrigButton);

const status = (dt: DoneTracker) => `${dt.name}:${dt.done ? "Done" : "Not done"}`;

const OrigContainerWithImageDelayingChildren = (
  props: DoneTrackedProps<{
    delay: number;
    src: string;
    children?: (doneTracker: NodeDoneTracker) => any;
  }>
) => {
  console.log("delayed component", props.doneTracker.id);
  const nodeDoneTracker = useNodeDoneTracker(props.doneTracker);
  const localDoneTracker = useLeafDoneTracker(nodeDoneTracker, { name: "Local" });
  const imageDoneTracker = useNodeDoneTracker(nodeDoneTracker, { name: "Image" });
  const childrenDoneTracker = useNodeDoneTracker(nodeDoneTracker, { name: "Children" });
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
      {status(localDoneTracker)} & {status(imageDoneTracker)} & {status(childrenDoneTracker)}
      <Image src={props.src} doneTracker={imageDoneTracker}/>
      {delaying ? "Delaying" : "Done"} {childrenComponents}
    </div>
  );
};

const ContainerWithImageDelayingChildren = visualizeDoneWrapper(
  OrigContainerWithImageDelayingChildren
);

const Tree = (props: { doneTracker: NodeDoneTracker; imageSrc: string }) => {
  const localDoneTracker = useNodeDoneTracker(props.doneTracker);

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
      <Button doneTracker={localDoneTracker} persistDone={true}>{"Click to make done (persisted)"}</Button>
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
Primary.args = {
  imageSrc: "https://picsum.photos/200/100",
};
