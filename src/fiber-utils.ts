import { Fiber } from "its-fine";

/* eslint-disable no-prototype-builtins */
function isHookThatCanScheduleUpdate(hookObject: any) {
  if (typeof window === "undefined") return;
  const queue = hookObject.queue;
  if (!queue) {
    return false;
  }

  const boundHasOwnProperty = Object.prototype.hasOwnProperty.bind(queue);

  // Detect the shape of useState() or useReducer()
  // using the attributes that are unique to these hooks
  // but also stable (e.g. not tied to current Lanes implementation)
  const isStateOrReducer =
    boundHasOwnProperty('pending') &&
    boundHasOwnProperty('dispatch') &&
    typeof queue.dispatch === 'function';

  // Detect useSyncExternalStore()
  const isSyncExternalStore =
    boundHasOwnProperty('value') &&
    boundHasOwnProperty('getSnapshot') &&
    typeof queue.getSnapshot === 'function';

  // These are the only types of hooks that can schedule an update.
  return isStateOrReducer || isSyncExternalStore;
}

function didStatefulHookChange(prev: any, next: any): boolean {
  const prevMemoizedState = prev.memoizedState;
  const nextMemoizedState = next.memoizedState;

  if (isHookThatCanScheduleUpdate(prev)) {
    return prevMemoizedState !== nextMemoizedState;
  }

  return false;
}

export function didHooksChange(prev: Fiber["memoizedState"], next: Fiber["memoizedState"]): boolean {
  if (prev == null || next == null) {
    return false;
  }

  // We can't report anything meaningful for hooks changes.
  if (
    next.hasOwnProperty('baseState') &&
    next.hasOwnProperty('memoizedState') &&
    next.hasOwnProperty('next') &&
    next.hasOwnProperty('queue')
  ) {
    while (next !== null) {
      if (didStatefulHookChange(prev, next)) {
        return true;
      } else {
        next = next.next;
        prev = prev.next;
      }
    }
  }

  return false;
}
