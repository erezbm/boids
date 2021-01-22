import Vector from './vector.js';
export default class Rectangle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    get center() { return new Vector(this.x + this.width / 2, this.y + this.height / 2); }
    withSize(width, height) { return new Rectangle(this.x, this.y, width, height); }
    withPadding(padding) {
        return Rectangle.fromCenterAndSize(this.center, this.width - 2 * padding, this.height - 2 * padding);
    }
    static fromCenterAndSize(center, width, height) {
        return new Rectangle(center.x - width / 2, center.y - height / 2, width, height);
    }
}
