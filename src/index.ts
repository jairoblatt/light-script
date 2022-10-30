import { createScript, destroyScript, getScript, Flags } from './script';
import { isString, toNumber, sleep } from './utils';
import { Fn, Maybe, Nullable, Numberish } from './types';
import type { Attrs, Props, Listeners, HTMLLightScriptElement } from './script';

export { destroyScript };
export type { Fn, Maybe, Nullable, Numberish };

interface ScriptEvent {
  event: Nullable<Event>;
  isCache: boolean;
  attempts: number;
}

type ScriptListener = (e: ScriptEvent) => void;
interface DefineScriptOptions<Suspense = boolean> extends Partial<Attrs & Omit<Props, 'src'>> {
  retry?: Numberish;
  retryDelay?: Numberish;
  suspense?: Suspense;
  wrapper?: string | Element;
  onError?: ScriptListener;
  onSuccess?: ScriptListener;
  onSettle?: ScriptListener;
  onRetry?: (attemps: number) => void;
}

type DefineScriptReturn<Suspense> = Suspense extends true
  ? { destroy: Fn; suspense: () => Promise<ScriptEvent> }
  : { destroy: Fn };

const qeue = new Map<string, Fn[]>();

export function defineScript<Suspense extends boolean>(
  src: string,
  {
    onError,
    onSuccess,
    onSettle,
    onRetry,
    wrapper,
    suspense,
    retry = 3,
    retryDelay = 1000,
    ...options
  }: DefineScriptOptions<Suspense> = {}
) {
  const payload = {
    attempts: 0,
    isCache: false,
  };

  const notify = (event: Nullable<Event>, ...listeners: Maybe<ScriptListener>[]) => {
    listeners?.forEach((listener) => listener?.({ event, ...payload }));
  };

  const _onSuccess = (e: Nullable<Event>, cb?: Maybe<ScriptListener>) => {
    notify(e, onSuccess, _onSettled, cb);
  };

  const createOnError = (cb?: Maybe<ScriptListener>) => {
    const _onError = (e: Event) => {
      (e.target as HTMLLightScriptElement).remove();
      return (
        handleRetry(() => init({ onError: _onError, onSuccess: _onSuccess }, true)) ||
        notify(e, onError, _onSettled, cb)
      );
    };

    return _onError;
  };

  const _onSettled = (e: ScriptEvent) => {
    const tasks = [...(qeue.get(src) || [])];
    qeue.delete(src);
    tasks.forEach((fn) => fn?.());
    onSettle?.(e);
  };

  const handleRetry = (cb: Fn) => {
    const hasRetry = retry && payload.attempts < retry;
    if (hasRetry) {
      payload.attempts++;
      sleep(toNumber(retryDelay)).finally(() => {
        onRetry?.(payload.attempts);
        cb();
      });
    }

    return hasRetry;
  };

  const init = ({ onError, onSuccess }: Listeners, force?: boolean) => {
    if (!force) {
      const task = qeue.get(src);
      if (task) {
        task.push(() => init({ onError, onSuccess }));
        return;
      } else qeue.set(src, []);
    }

    const script = getScript(src);

    if (script?.[Flags.IS_SUCCESS]) {
      payload.isCache = true;
      _onSuccess(null);
    } else {
      payload.isCache = false;
      resolveWrapper(wrapper).appendChild(
        createScript({
          src,
          onError,
          onSuccess,
          ...options,
        })
      );
    }
  };

  if (!suspense) {
    init({
      onError: createOnError(),
      onSuccess: _onSuccess,
    });
  }

  return {
    destroy: () => destroyScript(src),
    ...(suspense && {
      suspense: () =>
        new Promise((resolve, reject) =>
          init({
            onError: createOnError(reject),
            onSuccess: (e) => _onSuccess(e, resolve),
          })
        ),
    }),
  } as DefineScriptReturn<Suspense>;
}

export function defineAsyncScript(
  src: string,
  options: Omit<DefineScriptOptions, 'suspense'> = {}
) {
  return defineScript(src, { ...options, suspense: true }).suspense();
}

function resolveWrapper(wrapper: DefineScriptOptions['wrapper']) {
  let target: Element = document.head;
  if (wrapper) {
    if (isString(wrapper)) {
      const _wrapper = document.querySelector(wrapper);
      if (_wrapper) target = _wrapper;
    } else target = wrapper;
  }
  return target;
}
