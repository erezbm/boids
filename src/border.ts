import Boid from './boid.js';
import { clamp, mapRange } from './utils.js';
import Vector from './vector.js';

export default class Border {
  public static maxForce = Boid.maxForce * 2;

  constructor(private unitNormalForce: Vector, private maxEffectDistance: number, private distanceFn: (p: Vector, r: number) => number) { }

  calcNormalForce(position: Vector, radius: number) {
    const clampedDistance = clamp(this.distanceFn(position, radius), 0, this.maxEffectDistance);
    const mag = mapRange(clampedDistance, 0, this.maxEffectDistance, Border.maxForce, 0);
    return this.unitNormalForce.mult(mag);
  }
}
