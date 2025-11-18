import { DEBUG } from "./debug";

export const LOG_PREFIX = "[Done Tracker]";

export const debug = DEBUG
  ? console.debug.bind(console, LOG_PREFIX)
  : () => undefined;
export const log = DEBUG
  ? console.log.bind(console, LOG_PREFIX)
  : () => undefined;
export const warn = DEBUG
  ? console.warn.bind(console, LOG_PREFIX)
  : () => undefined;
export const alwaysWarn = console.warn.bind(console, LOG_PREFIX);
