import { useMemo } from "react";
import { NodeDoneTracker } from "./node-done-tracker";

export const useRootDoneTracker = (name = "Root", deps: any[] = []) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => new NodeDoneTracker(name), [name, ...deps]);
};
