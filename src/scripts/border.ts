import { clamp, filterUndefinedProps, mapRange } from './utils';
import Vector from './vector';

export type DistanceFunction = (p: Vector, r: number) => number;

export type BorderSettings = Readonly<{
  maxForce: number,
  effectDistance: number,
}>;

export type BorderSettingsChanges = Partial<BorderSettings>;

export default class Border {
  readonly #unitNormalForce: Vector;
  readonly #distanceFn: DistanceFunction;

  #settings: BorderSettings;

  constructor(unitNormalForce: Vector, distanceFn: DistanceFunction, settings: BorderSettings) {
    this.#unitNormalForce = unitNormalForce;
    this.#distanceFn = distanceFn;
    this.#settings = settings;
  }

  changeSettings(changes: BorderSettingsChanges) {
    this.#settings = { ...this.#settings, ...filterUndefinedProps(changes) };
  }

  calcNormalForce(position: Vector, radius: number) {
    const clampedDistance = clamp(this.#distanceFn(position, radius), 0, this.#settings.effectDistance);
    const mag = mapRange(clampedDistance, 0, this.#settings.effectDistance, this.#settings.maxForce, 0);
    return this.#unitNormalForce.mult(mag);
  }
}
