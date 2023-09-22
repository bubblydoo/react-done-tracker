import { useEffect } from "react";
import { useDoneTracker } from "./use-done-tracker";

export function useSignalChange(name: string, deps: any[]) {
  const dt = useDoneTracker({
    name,
    done: true,
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => dt.signalChange(), [dt, ...deps]);
}
