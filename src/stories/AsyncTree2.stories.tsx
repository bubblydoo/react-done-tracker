import { action } from "@storybook/addon-actions";
import { Meta, StoryFn } from "@storybook/react";
import React, { useEffect, useState } from "react";
import { DoneTrackedProps } from "../done-tracked";
import { DoneTracker } from "../done-tracker";
import { useDoneTracker } from "../done-tracker-hook";
import StoryWrapper from "./story-wrapper";
import OrigDelayedContainer from "../components/DelayedContainer";
import OrigDelayedComponent from "../components/DelayedComponent";
import OrigButton from "../components/Button";
import visualizeDoneWrapper from "../visualize-wrapper";

const DelayedContainer = visualizeDoneWrapper(OrigDelayedContainer);
const DelayedComponent = visualizeDoneWrapper(OrigDelayedComponent);
const Button = visualizeDoneWrapper(OrigButton);

const status = (dt: DoneTracker) => `${dt.name}:${dt.done ? "Done" : "Not done"}`;

const OrigContainerWithImageDelayingChildren = (
  props: DoneTrackedProps<{
    delay: number;
    src: string;
    children?: (doneTracker: DoneTracker) => any;
  }>
) => {
  console.log("delayed component", props.doneTracker.id);
  const localDoneTracker = useDoneTracker(props.doneTracker, "local");
  const imageDoneTracker = useDoneTracker(props.doneTracker, "image");
  const childrenDoneTracker = useDoneTracker(props.doneTracker, "children");
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

  const childrenWithProps = props.children?.(childrenDoneTracker);

  return (
    <div>
      {status(localDoneTracker)} & {status(imageDoneTracker)} & {status(childrenDoneTracker)}
      <img src={props.src} onLoad={() => imageDoneTracker.signalDone()}></img>
      {delaying ? "Delaying" : "Done"} {childrenWithProps}
    </div>
  );
};

const ContainerWithImageDelayingChildren = visualizeDoneWrapper(
  OrigContainerWithImageDelayingChildren
);

const Tree2 = (props: { doneTracker: DoneTracker; imageSrc: string }) => {
  const localDoneTracker = useDoneTracker(props.doneTracker);

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
    </>
  );
};

export default {
  component: Tree2,
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
