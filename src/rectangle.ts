import Vector from './vector.js';

export default class Rectangle {
  static readonly zero = new Rectangle(0, 0, 0, 0);

  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly width: number,
    public readonly height: number,
  ) { }

  static fromCenterAndSize(center: Vector, width: number, height: number) {
    return new Rectangle(center.x - width / 2, center.y - height / 2, width, height);
  }

  get center() { return new Vector(this.x + this.width / 2, this.y + this.height / 2); }

  withSize(width: number, height: number) { return new Rectangle(this.x, this.y, width, height); }

  withPadding(padding: number) {
    return Rectangle.fromCenterAndSize(this.center, this.width - 2 * padding, this.height - 2 * padding);
  }
}
