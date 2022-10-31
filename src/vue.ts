import { defineAsyncScript, defineScript, destroyScript, type DefineScriptOptions } from '.';
export const LighScriptVuePlugin = {
  install(Vue: any, globalOptions: DefineScriptOptions = {}) {
    Vue.defineScript = Vue.prototype.$defineScript = (
      src: string,
      options: DefineScriptOptions = {}
    ) => defineScript(src, { ...globalOptions, ...options });
    Vue.defineAsyncScript = Vue.prototype.$defineAsyncScript = (
      src: string,
      options: Omit<DefineScriptOptions, 'suspense'> = {}
    ) => defineAsyncScript(src, { ...globalOptions, ...options });
    Vue.destroyScript = Vue.prototype.$destroyScript = destroyScript;
  },
};
