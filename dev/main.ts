import { defineScript } from '../src/index';

const CND = 'https://unpkg.com/vue@3/dist/vue.global.js';

defineScript(CND, {
  onSuccess(e) {
    console.log({ e });
  },
  onRetry(attempt) {
    console.log({ attempt });
  },
});

defineScript(CND, {
  onSuccess(e) {
    console.log({ e });
  },
});
