import { Nullable, type Maybe } from '.';

export interface Props {
  /**
   *
   * @description The processing of the script contents is deferred. The charset and defer attributes have no effect.
   * For information on using module, unlike classic scripts, module scripts require the use of the CORS protocol
   * for cross-origin fetching
   *
   *
   * @See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
   *
   * @default false
   *
   */
  module: boolean;
}

export interface Attrs {
  id: string;
  src: string;
  /**
   *
   * @description If true: The script is downloaded in parallel to parsing the page,
   * and executed as soon as it is available (before parsing completes).
   *
   * @note If neither async or defer is true: The script is downloaded and
   * executed immediately, blocking parsing until the script is completed.
   *
   * @default false
   *
   */
  async: boolean;
  /**
   *
   * @description If true (and not async is true): The script is downloaded in parallel
   * to parsing the page, and executed after the page has finished parsing.
   *
   * @note If neither async or defer is true: The script is downloaded and
   * executed immediately, blocking parsing until the script is completed.
   *
   * @default false
   *
   */
  defer: boolean;
  /**
   *
   * @description This attribute contains inline metadata that a user agent can use to verify that a
   * fetched resource has been delivered free of unexpected manipulation.
   *
   * @note Subresource Integrity (SRI) is a W3C specification that allows web developers to ensure
   * that resources hosted on third-party servers have not been altered. Use of SRI is recommended!
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
   *
   * @default ''
   *
   */
  integrity: string;
  /**
   *
   * @description This Boolean attribute is set to indicate that the script should not be executed in browsers that support
   * ES modules —in effect, this can be used to serve fallback scripts to older browsers that do not support modular
   * JavaScript code.
   *
   * @default false
   *
   */
  noModule: boolean;
  /**
   *
   * @description Indicates which referrer to send when fetching the script, or resources fetched by the script;
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-referrerpolicy
   *
   * @default 'strict-origin-when-cross-origin'
   *
   */
  referrerPolicy:
    | 'no-referrer'
    | 'no-referrer-when-downgrade'
    | 'origin'
    | 'origin-when-cross-origin'
    | 'same-origin'
    | 'strict-origin'
    | 'strict-origin-when-cross-origin'
    | 'unsafe-url';
}

export interface Listeners {
  onError: (e: Event) => void;
  onSuccess: (e: Event) => void;
}

export const enum Flags {
  IS_SUCCESS = '__is_success',
  IS_LIGHT_SCRIPT = '__is_light_script',
}

export interface HTMLLightScriptElement extends HTMLScriptElement {
  [Flags.IS_LIGHT_SCRIPT]: boolean;
  [Flags.IS_SUCCESS]: boolean;
}

export function createScript({
  id,
  src,
  async,
  defer,
  module,
  noModule,
  integrity,
  referrerPolicy,
  onError,
  onSuccess,
}: Partial<Props & Listeners & Attrs> = {}) {
  const script = document.createElement('script') as HTMLLightScriptElement;

  const onBase = (e: Event, listener: Maybe<(e: Event) => void>, success?: boolean) => {
    setSuccess(script, success);
    listener?.(e);
  };

  const onerror = (e: Event) => onBase(e, onError, false);

  Object.assign(script, {
    onerror,
    onabort: onerror,
    onload: (e: Event) => onBase(e, onSuccess),
    [Flags.IS_SUCCESS]: false,
    [Flags.IS_LIGHT_SCRIPT]: true,
    type: module ? 'module' : 'text/javascript',
    ...sanitizeProps({
      id,
      src,
      async,
      defer,
      noModule,
      integrity,
      referrerPolicy,
    }),
  });

  return script;
}

export function destroyScript(src: string) {
  const script = getScript(src);
  if (script) {
    script.remove();
  }
}

export function getScript(src: string) {
  const script = document.querySelector(`script[src="${src}"]`) as Nullable<HTMLLightScriptElement>;
  return isScript(script) ? script : null;
}

function setSuccess(script: HTMLLightScriptElement, success = true) {
  if (isScript(script)) {
    script[Flags.IS_SUCCESS] = success;
  }
}

function isScript(script: Maybe<HTMLLightScriptElement>) {
  return script && script[Flags.IS_LIGHT_SCRIPT];
}

function sanitizeProps(props: object) {
  return Object.fromEntries(Object.entries(props).filter(([, value]) => value));
}
