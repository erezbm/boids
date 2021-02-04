import Rectangle from './rectangle';

export default class Vector {
  static readonly zero = new Vector(0, 0);

  constructor(public readonly x = 0, public readonly y = 0) { }

  static fromAngle(angle: number) { return new Vector(Math.cos(angle), Math.sin(angle)); }

  static randomInRect({ x, y, width, height }: Rectangle) {
    return new Vector(x + Math.random() * width, y + Math.random() * height);
  }

  static randomUnit() { return Vector.fromAngle(Math.random() * (2 * Math.PI)); }

  static randomMag(m: number) { return Vector.randomUnit().mult(m); }

  add(v: Vector) { return new Vector(this.x + v.x, this.y + v.y); }

  sub(v: Vector) { return this.add(v.mult(-1)); }

  mult(n: number) { return new Vector(this.x * n, this.y * n); }

  div(n: number) { return this.mult(1 / n); }

  mag() { return Math.sqrt(this.magSquared()); }

  magSquared() { return this.x * this.x + this.y * this.y; }

  magLT(m: number) { return this.magSquared() < m ** 2; }
  magLTE(m: number) { return this.magSquared() <= m ** 2; }
  magGT(m: number) { return !this.magLTE(m); }
  magGTE(m: number) { return !this.magLT(m); }

  withMag(m: number) { return this.mult(m / (this.mag() || 1)); }

  limitMag(m: number) { return this.magLTE(m) ? this : this.withMag(m); }

  unit() { return this.withMag(1); }

  dist(v: Vector) { return this.sub(v).mag(); }

  distLT(v: Vector, distance: number) { return this.sub(v).magLT(distance); }
  distLTE(v: Vector, distance: number) { return this.sub(v).magLTE(distance); }
  distGT(v: Vector, distance: number) { return !this.distLTE(v, distance); }
  distGTE(v: Vector, distance: number) { return !this.distLT(v, distance); }

  angle() { return Math.atan2(this.y, this.x); }

  static sum(vectors: readonly Vector[]) { return vectors.reduce((sum, current) => sum.add(current), Vector.zero); }

  static average(vectors: readonly Vector[]) { return Vector.sum(vectors).div(vectors.length); }
}
