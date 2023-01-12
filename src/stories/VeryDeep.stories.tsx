import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import React, { useEffect, useState } from "react";
import { visualizeDoneWrapper } from "../visualize-wrapper";
import { ContextualStoryDecorator } from "./StoryWrapper";
import { useLeafDoneTracker } from "../use-leaf-done-tracker";

function Buttons({ persistDone = false }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<any>();

  const dt = useLeafDoneTracker({
    name: "Buttons",
    done,
    error,
  });

  useEffect(() => {
    if (!persistDone) {
      setDone(false);
      setError(undefined);
    }
  }, [dt, persistDone]);

  return (
    <>
      <button onClick={() => setDone(true)}>✅ Done</button>
      <button onClick={() => setError("blabla")}>❌ Error</button>
    </>
  );
}

let Buttons2: any = Buttons;
for (let i = 0; i < 100; i++)
  Buttons2 = visualizeDoneWrapper(Buttons2, "Buttons");

export default {
  title: "Contextual API/Very deep",
  component: Buttons2,
  decorators: [
    ContextualStoryDecorator({
      onDone: action("done"),
      onAbort: action("abort"),
      onError: action("error"),
      onPending: action("pending"),
    }),
  ],
} as Meta;

export const Primary = { args: { persistDone: true } };
