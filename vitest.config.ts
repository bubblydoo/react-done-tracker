import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          globals: true,
          environment: "jsdom",
          setupFiles: ["vitest-cleanup-after-each.ts"],
        }
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
            storybookUrl: process.env.STORYBOOK_URL || 'http://localhost:6006',
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            instances: process.env.TEST_ALL_BROWSERS ? [
              {
                browser: "chromium",
                provider: playwright(),
              },
              {
                browser: "firefox",
                provider: playwright(),
              },
              {
                browser: "webkit",
                provider: playwright(),
              },
            ] : [
              {
                browser: "chromium",
                provider: playwright(),
                headless: process.env.DEBUG ? false : true,
                // devtools: process.env.DEBUG ? true : false,
              }
            ],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
