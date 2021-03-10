export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
export const mapRange = (value: number, x1: number, y1: number, x2: number, y2: number) => (value - x1) * ((y2 - x2) / (y1 - x1)) + x2;
export const toRadians = (degrees: number) => degrees * (Math.PI / 180);

export const isWebpSupported = () => document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;

export const filterProps = <T, TResult = T>(object: T, predicate: (key: keyof T, value: T[keyof T]) => boolean) => (
  Object.fromEntries(Object.entries(object).filter(([key, value]) => predicate(key as keyof T, value))) as TResult
);

export const filterInvalidKeys = <T, TKeys extends readonly (keyof T)[]>(change: T, validKeys: TKeys) => (
  filterProps<T, Pick<T, TKeys[number]>>(change, (key) => validKeys.includes(key as keyof T))
);

export type Mutable<T> = { -readonly [K in keyof T]: T[K] };

export type OmitSafe<T, K extends keyof T> = Omit<T, K>;
