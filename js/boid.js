export default class Boid {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 2;
    }
    calcForce(boids, width, height) {
        return { x: 0, y: 0 };
    }
    update(force, dt) {
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
    }
}
