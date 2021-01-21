export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
export const mapRange = (value, x1, y1, x2, y2) => (value - x1) * ((y2 - x2) / (y1 - x1)) + x2;
export const toRadians = (degrees) => degrees * (Math.PI / 180);
