import React, {
  ComponentPropsWithoutRef,
  ElementType,
  useCallback,
} from "react";
import { DoneTrackerContext } from "./done-tracker-context";
import { NodeDoneTracker } from "./node-done-tracker";
import { useDoneTrackerContext } from "./use-done-tracker-context";

export function imperativeToContextual<
  T extends ElementType,
  P extends {
    children?: ReturnType<ComponentPropsWithoutRef<T>["children"]>;
  } & Omit<ComponentPropsWithoutRef<T>, "children" | "doneTracker">
>(
  Component: T,
  {
    dontContextualizeChildren = false,
    displayName,
  }: { dontContextualizeChildren?: boolean; displayName?: string } = {}
) {
  const componentDisplayName = (Component as any).displayName;

  const ImperativeToContextual = React.forwardRef<T, P>(
    function ImperativeToContextual(props, ref) {
      const doneTracker = useDoneTrackerContext();
      const children = 'children' in props ? props.children : undefined;
      const childrenFn = useCallback(
        (doneTracker: NodeDoneTracker) => (
          <DoneTrackerContext.Provider value={doneTracker}>
            {children}
          </DoneTrackerContext.Provider>
        ),
        [children]
      );
      return (
        <Component {...(props as any)} doneTracker={doneTracker} ref={ref}>
          {dontContextualizeChildren ? children : childrenFn}
        </Component>
      );
    }
  );

  ImperativeToContextual.displayName =
    displayName ||
    (componentDisplayName
      ? `ImperativeToContextual(${componentDisplayName})`
      : "ImperativeToContextual");

  return ImperativeToContextual;
}
