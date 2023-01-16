import { useDoneTracker } from "./use-done-tracker";

/** Create a done tracker next to the hook you pass in! */
export function doneTrackHook<
  Hook extends (...args: any[]) => any,
  Args extends Parameters<Hook>,
  Result extends ReturnType<Hook>
>(
  useHook: Hook,
  options: {
    name?: string;
    isDone: (result: Result, args: Args) => boolean;
    nameFromArgs?: (...args: Args) => string;
  }
): Hook {
  return ((...args: Args) => {
    const result = useHook(...args);
    useDoneTracker({
      name:
        options.name ||
        options.nameFromArgs?.(...args) ||
        (useHook.name ? `doneTrackHook(${useHook.name})` : "doneTrackHook"),
      done: options.isDone(result, args),
    });
    return result;
  }) as Hook;
}
