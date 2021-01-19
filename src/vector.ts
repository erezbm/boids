export default class Vector {
  constructor(public readonly x = 0, public readonly y = 0) { }

  add(v: Vector) { return new Vector(this.x + v.x, this.y + v.y); }

  sub(v: Vector) { return this.add(v.mult(-1)); }

  mult(n: number) { return new Vector(this.x * n, this.y * n); }

  div(n: number) { return this.mult(1 / n); }

  mag() { return Math.sqrt(this.magSquared()); }

  private magSquared() { return this.x * this.x + this.y * this.y; }

  magLessThan(m: number) { return this.magSquared() <= m * m; }

  withMag(newMag: number) { return this.mult(newMag / this.mag()); }

  limitMag(limit: number) { return this.magSquared() > limit ** 2 ? this.withMag(limit) : this; }

  dist(v: Vector) { return this.sub(v).mag(); }

  distLessThan(v: Vector, distance: number) { return this.sub(v).magLessThan(distance); }

  static randomInRect(x: number, y: number, width: number, height: number) {
    return new Vector(x + Math.random() * width, y + Math.random() * height);
  }
}
