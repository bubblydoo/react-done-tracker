import { alwaysWarn } from "./log";

/**
 * This is basically just `queueMicrotask`,
 * but in some environments (e.g. sometimes in Storybook in an iframe),
 * `queueMicrotask` never gets called.
 * So we also schedule a macrotask as a backup.
 */
export const queueMicrotaskOrAsap: typeof queueMicrotask = (fn) => {
  let ignore = false;
  const start = +new Date();

  const timeoutId = setTimeout(() => {
    if (ignore) return;
    ignore = true;
    fn();
  }, 1000);

  queueMicrotask(() => {
    clearTimeout(timeoutId);
    const diff = +new Date() - start;
    if (diff > 750) {
      alwaysWarn(`queueMicrotask took ${diff}ms`);
    }
    if (ignore) return;
    ignore = true;
    return fn();
  });
};
