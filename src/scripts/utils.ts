export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
export const mapRange = (value: number, x1: number, y1: number, x2: number, y2: number) => (value - x1) * ((y2 - x2) / (y1 - x1)) + x2;
export const toRadians = (degrees: number) => degrees * (Math.PI / 180);

export type FilterUndefined<T> = {
  [P in keyof T]: NonNullable<T[P]>
};
export const filterUndefinedProps = <T>(object: T) => (
  Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined)) as FilterUndefined<T>
);

export type OmitSafe<T, K extends keyof T> = Omit<T, K>;
