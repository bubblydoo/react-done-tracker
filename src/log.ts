import { DEBUG } from "./debug";

export const debug = DEBUG
  ? console.debug.bind(console, "[Done Tracker]")
  : () => undefined;
export const log = DEBUG
  ? console.log.bind(console, "[Done Tracker]")
  : () => undefined;
export const warn = DEBUG
  ? console.warn.bind(console, "[Done Tracker]")
  : () => undefined;
export const alwaysWarn = console.warn.bind(console, "[Done Tracker]");
