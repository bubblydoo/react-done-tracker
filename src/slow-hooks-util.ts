import { useRef, useMemo, useState, useEffect, useCallback, useReducer } from "react";
import { useDoneTracker } from "./use-done-tracker";

export function doneTrackSlowHookWithDelay<
  Hook extends (...args: any[]) => any,
  Args extends Parameters<Hook>
>(
  useHook: Hook,
  options: {
    name?: string;
    delay: number;
    argsEqual: (a: Args, b: Args) => boolean;
  }
) {
  return ((...args: Args) => {
    const result = useHook(...args);
    const inputRef = useRef<number>(0);

    const equalizedArgsRef = useRef<Args>(args);

    if (!options.argsEqual?.(equalizedArgsRef.current, args)) {
      inputRef.current++
      equalizedArgsRef.current = args;
    }

    const input = inputRef.current;
    const [output, setOutput] = useState<number | null>(null);

    useEffect(() => {
      const timeoutId = setTimeout(
        () => setOutput(inputRef.current),
        options.delay
      );
      return () => clearTimeout(timeoutId);
    }, [inputRef.current]);

    useDoneTracker({
      name:
        options.name || useHook.name
          ? `doneTrackSlowHookWithDelay(${useHook.name})`
          : "doneTrackSlowHookWithDelay",
      done: input === output,
    });

    return result;
  }) as Hook;
}

export function doneTrackSlowHookWithEffectsDelay<
  Hook extends (...args: any[]) => any,
  Args extends Parameters<Hook>
>(
  useHook: Hook,
  options: {
    name?: string;
    waitEffects: number;
    argsEqual: (a: Args, b: Args) => boolean;
  }
) {
  return ((...args: Args) => {
    const result = useHook(...args);

    const equalizedArgsRef = useRef<Args>(args);

    const effectsCounter = useNEffectsLater(options.waitEffects);

    if (!options.argsEqual?.(equalizedArgsRef.current, args)) {
      equalizedArgsRef.current = args;
      effectsCounter.reset();
    }

    useDoneTracker({
      name:
        options.name || useHook.name
          ? `doneTrackSlowHookWithEffectsDelay(${useHook.name})`
          : "doneTrackSlowHookWithEffectsDelay",
      done: effectsCounter.done,
    });

    return result;
  }) as Hook;
}

const useNEffectsLater = (n: number) => {
  const outputRef = useRef<number>(0);
  const [, rerender] = useReducer(i => i + 1, 0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { outputRef.current++ }, [{}]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => outputRef.current === n ? rerender() : undefined, [outputRef.current, n])

  return {
    get done() {
      return outputRef.current >= n
    },
    reset: useCallback(() => outputRef.current = 0, [])
  };
};

// const useNEffectsLater = (input: number, n: number) => {
//   let tmp: number | null = input;

//   for (let i = 0; i < n; i++) {
//     // eslint-disable-next-line react-hooks/rules-of-hooks
//     tmp = useOneEffectLater(tmp!);
//     console.log(i, n, input, tmp);
//   }

//   return tmp;
// };
