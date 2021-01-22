export default class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    add(v) { return new Vector(this.x + v.x, this.y + v.y); }
    sub(v) { return this.add(v.mult(-1)); }
    mult(n) { return new Vector(this.x * n, this.y * n); }
    div(n) { return this.mult(1 / n); }
    mag() { return Math.sqrt(this.magSquared()); }
    magSquared() { return this.x * this.x + this.y * this.y; }
    magLT(m) { return this.magSquared() < m ** 2; }
    magLTE(m) { return this.magSquared() <= m ** 2; }
    magGT(m) { return !this.magLTE(m); }
    magGTE(m) { return !this.magLT(m); }
    withMag(m) { return this.mult(m / (this.mag() || 1)); }
    limitMag(m) { return this.magLTE(m) ? this : this.withMag(m); }
    dist(v) { return this.sub(v).mag(); }
    distLT(v, distance) { return this.sub(v).magLT(distance); }
    distLTE(v, distance) { return this.sub(v).magLTE(distance); }
    distGT(v, distance) { return !this.distLTE(v, distance); }
    distGTE(v, distance) { return !this.distLT(v, distance); }
    angle() { return Math.atan2(this.y, this.x); }
    static fromAngle(angle) { return new Vector(Math.cos(angle), Math.sin(angle)); }
    static randomInRect({ x, y, width, height }) {
        return new Vector(x + Math.random() * width, y + Math.random() * height);
    }
    static randomUnit() { return Vector.fromAngle(Math.random() * (2 * Math.PI)); }
    static randomMag(m) { return Vector.randomUnit().mult(m); }
}
Vector.zero = new Vector(0, 0);
