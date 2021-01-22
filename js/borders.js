import Border from './border.js';
import Vector from './vector.js';
export default class RectBorders {
    constructor(spaceRect) {
        this.spaceRect = spaceRect;
        this.borders = [
            new Border(new Vector(1, 0), RectBorders.effectPadding, (p, r) => (p.x - r) - this.spaceRect.x),
            new Border(new Vector(0, 1), RectBorders.effectPadding, (p, r) => (p.y - r) - this.spaceRect.y),
            new Border(new Vector(-1, 0), RectBorders.effectPadding, (p, r) => (this.spaceRect.x + this.spaceRect.width) - (p.x + r)),
            new Border(new Vector(0, -1), RectBorders.effectPadding, (p, r) => (this.spaceRect.y + this.spaceRect.height) - (p.y + r)),
        ];
    }
    setSize(width, height) {
        this.spaceRect = this.spaceRect.withSize(width, height);
    }
    getFreeZone() { return this.spaceRect.withPadding(RectBorders.effectPadding); }
    calcForce(position, radius) {
        return this.borders
            .map((border) => border.calcNormalForce(position, radius))
            .reduce((sum, current) => sum.add(current));
    }
    draw(ctx) {
        const { x, y, width, height } = this.spaceRect;
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + RectBorders.effectPadding, y + RectBorders.effectPadding, width - 2 * RectBorders.effectPadding, height - 2 * RectBorders.effectPadding);
    }
}
RectBorders.effectPadding = 50;
