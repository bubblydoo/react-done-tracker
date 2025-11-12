import type { Preview } from "@storybook/react-vite";

import "./global.css";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    docs: {
      canvas: {
        sourceState: "none",
      },
      source: {
        format: "dedent",
      },
    },
  },
};

export default preview;

export const tags = ["autodocs"];
