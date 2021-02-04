export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
export const mapRange = (value: number, x1: number, y1: number, x2: number, y2: number) => (value - x1) * ((y2 - x2) / (y1 - x1)) + x2;
export const toRadians = (degrees: number) => degrees * (Math.PI / 180);
