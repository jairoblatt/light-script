import type { Maybe, Numberish } from '.';

export const isString = (val: unknown): val is string => typeof val === 'string';
export const sleep = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));
export const toNumber = (val: Maybe<Numberish>) => (isNaN(Number(val)) ? 0 : Number(val));
