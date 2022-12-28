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
>(Component: T, dontContextualizeChildren = false) {
  const displayName = (Component as any).displayName;

  const ImperativeToContextual = React.forwardRef<T, P>(
    function ImperativeToContextual(props, ref) {
      const doneTracker = useDoneTrackerContext();
      const childrenFn = useCallback(
        (doneTracker: NodeDoneTracker) => (
          <DoneTrackerContext.Provider value={doneTracker}>
            {props.children}
          </DoneTrackerContext.Provider>
        ),
        [props.children]
      );
      return (
        <Component {...(props as any)} doneTracker={doneTracker} ref={ref}>
          {dontContextualizeChildren ? props.children : childrenFn}
        </Component>
      );
    }
  );

  ImperativeToContextual.displayName = displayName
    ? `ImperativeToContextual(${displayName})`
    : "ImperativeToContextual";

  return ImperativeToContextual;
}
