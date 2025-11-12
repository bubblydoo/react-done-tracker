import { action } from "storybook/actions";
import { Meta } from "@storybook/react-vite";
import React, { useState } from "react";
import { ContextualStoryDecorator } from "./StoryWrapper";
import { DoneTrackedSuspense } from "../components/DoneTrackedSuspense";

const promises = new Map<number, Promise<void>>();
const datas = new Map<number, string>();

function getPromise(dataId: number) {
  if (promises.has(dataId)) return promises.get(dataId);
  const newPromise = new Promise<void>((resolve) => setTimeout(resolve, 2000));
  promises.set(dataId, newPromise);
  newPromise.then(() => datas.set(dataId, `data for ${dataId}`));
  return newPromise;
}

function SuspendingComponent({ dataId }: { dataId: number }) {
  const data = datas.get(dataId);
  if (!data) throw getPromise(dataId);
  return <div>{data}</div>;
}

function SuspenseDemo() {
  const [dataId, setDataId] = useState(0);

  // use key to reset done state inside DoneTrackedSuspense
  return (
    <>
      <button onClick={() => setDataId((i) => i + 1)}>New data id</button>
      <DoneTrackedSuspense fallback={<div>Loading data for {dataId}...</div>}>
        <SuspendingComponent dataId={dataId} />
      </DoneTrackedSuspense>
    </>
  );
}

export default {
  title: "Contextual API/Suspense",
  component: SuspenseDemo,
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

export const Primary = { args: {} };
