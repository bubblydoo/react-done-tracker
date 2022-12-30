import { action } from "@storybook/addon-actions";
import { jest } from "@storybook/jest";

export const actions = {
  onDone: action("done"),
  onAbort: action("abort"),
  onError: action("error"),
  onPending: action("pending"),
};

export function createSpyableActions() {
  const spyableActions: Record<
    keyof typeof actions,
    jest.Mock<void, []>
  > = Object.fromEntries(
    Object.entries(actions).map(([k, v]) => {
      const fn = jest.fn(v);
      // set function name for storybook interaction view
      Object.defineProperty(fn, "name", { value: k });
      return [k as any, fn] as const;
    })
  );

  const actionsMockReset = () => {
    Object.values(spyableActions).forEach((action) => action.mockReset());
  };

  return { actions: spyableActions, actionsMockReset };
}
