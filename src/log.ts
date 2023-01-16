import { DEBUG } from "./debug";

export const debug = DEBUG
  ? console.debug.bind(window.console, "[Done Tracker]")
  : () => undefined;
export const log = DEBUG
  ? console.log.bind(window.console, "[Done Tracker]")
  : () => undefined;
export const warn = DEBUG
  ? console.warn.bind(window.console, "[Done Tracker]")
  : () => undefined;
export const alwaysWarn = console.warn.bind(window.console, "[Done Tracker]");
