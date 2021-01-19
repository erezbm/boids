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
    magLessThan(m) { return this.magSquared() <= m * m; }
    dist(v) { return this.sub(v).mag(); }
    distLessThan(v, distance) { return this.sub(v).magLessThan(distance); }
    static randomInRect(x, y, width, height) {
        return new Vector(x + Math.random() * width, y + Math.random() * height);
    }
}
