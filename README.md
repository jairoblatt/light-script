



## Todo: 

- [x] `defineScript`
- [x] `defineAsynScript`
- [x] `destroyScript`
- [ ] Vue 2 and Nuxt.js/3 plugin.
- [ ] `useScript` and `useAsynScript` Vue 3/Nuxt 3 composable.
- [ ] `useScript` React hook.
- [ ] Unit tests.
- [ ] SSR and SSG.
- [ ] Improve docs.

## 📦 installation

### npm:

```bash
npm i @jrblatt/light-script
```

### yarn:

```bash
yarn add @jrblatt/light-script
```

## 🦜 Usage 

### ESM
```js
import { defineScript } from '@jrblatt/light-script'

defineScript('https://my-script.js');
```
### Cdn
You can use lightScript directly from a CDN via a script tag:

```html
<script src="https://unpkg.com/@jrblatt/light-script@latest/dist/lightScript.min.js"></script>

<script>
const { defineScript } = lightScript;

defineScript('https://my-script.js');
</script>
```
### Cdn + module 
```html
<script type="module">
 import { defineScript } from 'https://unpkg.com/@jrblatt/light-script@latest/dist/lightScript.min.js'

defineScript('https://my-script.js')
</script>
```


### Cdn + module as importmap 
``` html
<script type="importmap">
 {
    "imports": {
      "light-script": "https://unpkg.com/@jrblatt/light-script@latest/dist/lightScript.min.js"
    }
  }
</script>
<script type="module">
 import { defineScript } from '@jrblatt/light-script'

 defineScript('https://my-script.js');
<script>
```


## Suspense mode

Some times you need to run async logic using the good old promises, in this case you can use the `suspense: true` option, wich will make `defineScript` return a plain promise function called `suspense`.

### Using `suspense` option
#### Example
```js
const { suspense } = defineScript('http://my-script.js', { suspense: true });

try {
 const success = await suspense();
 console.log(success);
} catch(error){
  console.error('Something went wrong!', error)
}
```
#### Type 
```js
function suspense(): Promise<LighScriptEvent>
```
### Using `defineAsyncScript`
You can also load an async script without define the `suspense: true` option, instead use the sugar function `defineAsyncScript`.

> Which in some cases helps to reduce verbosity :)


#### Example
```js
 try {
    await defineAsyncScript('my-script.js');
 } catch(event) {
    console.error('Something went wrong!', event)
 }
```
`defineAsyncScript` is a sugar function to: 
```js
function defineAsyncScript(src, options){
    return defineScript(src, { suspense: true, ...options }).suspense()
}
```

#### Type
```js
function defineAsyncScript(src: string, options: Omit<DefineScriptOptions, 'suspense'>): Promise<LighScriptEvent>
```

Note: `onSuccess`, `onError` and `onSettled` still called even if you are using `suspense` or `defineAsynScript`.
#### Example
`then` and `onSuccess` will be fired.
```js
defineAsyncScript('my-script.js', { onSuccess: console.log }).then(console.log)
```

## Remove a script
If you need to remove any lightScript of the Document flow, use `destroyScript` to do that.
### Example
```js 
import { destroyScript }  from '@jrblatt/light-script';
// It will remove the eascript of the document.
destroyScript('my-script.js')
```

### Type
```js
function destroyScript(src: string): void;
```

## Event payload

The event payload is emitted as  `then`, `catch`, `onSuccess`, `onError` and `onSettled` are fired.

### Example
```js
defineScript('https://unpkg.com/vue@3/dist/vue.global.js', {
  onSuccess({ isCache, attempts, event }){
    if(!isCache){
        Vue.createApp({
          data: () => ({
              message: 'Hello Vue!'
          })
        }).mount('#app')
    }
  }
})
```

### Type
```js
{
 
  event: Event,  // onerror, onabort or onload event native payload.
  attempts: number // Attempts until the script is loaded or the retries ended.
  isCache: boolean, // If you try to load an already loaded script, then it will be true.
}
```


## Example
```js
import { defineScript } from '@jrblatt/light-script';

const { destroy, suspense } = defineScript('https://cdn.jsdelivr.net/npm/preact/dist/preact.min.js', {
  async: true,
  defer: true,
  id: 'preact',
  integrity: 'hash',
  module: true,
  referrerPolicy: 'strict-origin-when-cross-origin',
  retry: 4,
  retryDelay: 2000,
  wrapper: 'body',
  suspense: true,
  onError(e) {
    console.error(e);
  },
  onSettle(e) {
    console.warn(e);
  },
  onSuccess(e) {
    console.log(e)
  },
  onRetry(attempts) {
    console.warn(attempts)
  }
});

await suspense();
```



## Options

| Name          | type             | Default   | description                                       |
| ------------- | ---------------- | --------- | ------------------------------------------------- |
| `id`      | String          | undefined     | Default script element attribute Id |
| `async`         | Boolean           | false | Default script element attribute [async](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-async)     |
| `defer`         | Boolean  | false |  Default script element attribute [defer](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-defer)           |
| `integrity`        | String          | undefined      | Default script element attribute [integrity](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-integrity)                    |
| `module` | Boolean  | false       |  Set this to `true` to define `type="module" `                      |
| `noModule` | Boolean          | false     | Default script element attribute [noModule](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-nomodule)                          |
| `referrerPolicy`         | String | 'strict-origin-when-cross-origin'     | Default script element attribute [referrerPolicy](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-referrerpolicy)   |
| `retry`       | Numberish          | 3     | The failed script will retry until the failed script count meets that number.                       |
| `retryDelay`     | Numberish          | 1000      | Set the time in `ms` between each retry.                                   |
| `wrapper`       | Element - String          | document.head     | Specify target container. Can either be a selector or an actual element.                        |
| `suspense`       | Boolean | false     | If set to `true` will return a `suspense` promise.  [Example](#suspense-mode)                            |
| `onSuccess` | Function | undefined|  This function will fire any time the script successfully loaded. |
| `onError` | Function | undefined | This function will fire if the script failed to load or is aborted. |
| `onSettled` | Function | undefined | This function will fire any time the script is either successful or failure. |
| `onRetry` | Function | undefined | This function will fire before any time the a new retry is performed. |

## 📄 License

[MIT License](https://github.com/jairoblatt/ligh-script/main/LICENSE) © 2022-PRESENT [Jairo Blatt](https://github.com/jairoblatt)