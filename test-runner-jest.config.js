import { getJestConfig } from '@storybook/test-runner';

// The default Jest configuration comes from @storybook/test-runner
const testRunnerConfig = getJestConfig();

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
export default {
  ...testRunnerConfig,
  /** Add your own overrides below, and make sure
   *  to merge testRunnerConfig properties with your own
   * @see https://jestjs.io/docs/configuration
   */
  testEnvironmentOptions: {
    ...testRunnerConfig.testEnvironmentOptions,
    'jest-playwright': {
      ...testRunnerConfig.testEnvironmentOptions['jest-playwright'],
      // eslint-disable-next-line no-undef
      launchOptions: process.env.DEBUG ? {
        ...testRunnerConfig.testEnvironmentOptions['jest-playwright'].launchOptions,
        headless: false,
        devtools: true,
      } : {}
    }
  },
};
