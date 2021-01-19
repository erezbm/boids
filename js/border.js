import { clamp, mapRange } from './utils.js';
export default class Border {
    constructor(unitNormalForce, distanceFn) {
        this.unitNormalForce = unitNormalForce;
        this.distanceFn = distanceFn;
    }
    calcNormalForce(p, r) {
        const clampedDistance = clamp(this.distanceFn(p, r), 0, Border.maxDistance);
        const mag = mapRange(clampedDistance, 0, Border.maxDistance, Border.maxForce, 0);
        return this.unitNormalForce.mult(mag);
    }
}
Border.maxDistance = 100;
Border.maxForce = 50;
