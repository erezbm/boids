import { clamp, mapRange } from '../utils';
import Vector from '../vector';

export type DistanceFunction = (p: Vector, r: number) => number;

export default class Border {
  readonly #unitNormalForce: Vector;
  readonly #distanceFn: DistanceFunction;

  constructor(unitNormalForce: Vector, distanceFn: DistanceFunction, public maxForce: number, public effectDistance: number) {
    this.#unitNormalForce = unitNormalForce;
    this.#distanceFn = distanceFn;
  }

  calcNormalForce(position: Vector, radius: number) {
    const clampedDistance = clamp(this.#distanceFn(position, radius), 0, this.effectDistance);
    const mag = mapRange(clampedDistance, 0, this.effectDistance, this.maxForce, 0);
    return this.#unitNormalForce.mult(mag);
  }
}
