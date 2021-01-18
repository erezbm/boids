export default class Boid {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = Boid.RADIUS;
    }
    static createInRandomPosition(width, height) {
        const radius = Boid.RADIUS;
        return new Boid(radius + Math.random() * (width - 2 * radius), radius + Math.random() * (height - 2 * radius));
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
Boid.RADIUS = 2;
