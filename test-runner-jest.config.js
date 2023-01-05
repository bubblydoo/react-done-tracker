/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const { getJestConfig } = require('@storybook/test-runner');

module.exports = {
  // The default configuration comes from @storybook/test-runner
  ...getJestConfig(),
  /** Add your own overrides below
   * @see https://jestjs.io/docs/configuration
   */
  testEnvironmentOptions: {
    'jest-playwright': {
      browser: 'chromium',
      launchOptions: process.env.DEBUG ? {
        headless: false,
        devtools: true,
      } : {}
    }
  }
};
