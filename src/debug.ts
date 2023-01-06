declare global {
  // eslint-disable-next-line no-var
  var __debug_react_done_tracker: boolean;
}
export const DEBUG = typeof globalThis === "object" && globalThis.__debug_react_done_tracker;
