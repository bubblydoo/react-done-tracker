import { action as actionFn } from "storybook/actions";
import * as test from "storybook/test";

export function createSpyableActions<
  A extends Record<string, ReturnType<typeof actionFn>>
>(actions: A): {
  actions: Record<keyof A, test.Mock>;
  actionsMockClear: () => void;
} {
  const spyableActions: Record<
    keyof A,
    test.Mock
  > = Object.fromEntries(
    Object.entries(actions).map(([k, actionFn]) => {
      const fn = test.fn(actionFn);
      // set function name for storybook interaction view
      Object.defineProperty(fn, "name", { value: k });
      return [k as any, fn] as const;
    })
  );

  const actionsMockClear = () => {
    Object.values(spyableActions).forEach((action) => action.mockClear());
  };

  return { actions: spyableActions, actionsMockClear };
}

export async function doneTrackerUtils(canvas: any) {
  const stateText = await canvas.findByTestId("root-state");
  const refreshButton = await canvas.findByTestId("new-root-done-tracker");
  return {
    status: () => stateText.innerHTML as string,
    refresh: () => test.fireEvent.click(refreshButton),
    wait: () => delay(20),
  };
}

export const delay = (n: number) => new Promise((res) => setTimeout(res, n));
