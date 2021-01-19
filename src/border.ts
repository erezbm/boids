import { clamp, mapRange } from './utils.js';
import Vector from './vector.js';

export default class Border {
  public static maxDistance = 100;
  private static maxForce = 50;

  constructor(private unitNormalForce: Vector, private distanceFn: (p: Vector, r: number) => number) { }

  calcNormalForce(p: Vector, r: number) {
    const clampedDistance = clamp(this.distanceFn(p, r), 0, Border.maxDistance);
    const mag = mapRange(clampedDistance, 0, Border.maxDistance, Border.maxForce, 0);
    return this.unitNormalForce.mult(mag);
  }
}
