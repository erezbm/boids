import Boid from './boid.js';
import { clamp, mapRange } from './utils.js';
export default class Border {
    constructor(unitNormalForce, maxEffectDistance, distanceFn) {
        this.unitNormalForce = unitNormalForce;
        this.maxEffectDistance = maxEffectDistance;
        this.distanceFn = distanceFn;
    }
    calcNormalForce(position, radius) {
        const clampedDistance = clamp(this.distanceFn(position, radius), 0, this.maxEffectDistance);
        const mag = mapRange(clampedDistance, 0, this.maxEffectDistance, Border.maxForce, 0);
        return this.unitNormalForce.mult(mag);
    }
}
Border.maxForce = Boid.maxForce * 2;
