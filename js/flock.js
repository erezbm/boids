import Boid from './boid.js';
export default class Flock {
    constructor(numBoids, width, height) {
        this.boids = [];
        this.addBoids(numBoids, width, height);
    }
    addBoids(num, width, height) {
        this.boids = [...this.boids, ...Array.from({ length: num }, () => new Boid((Math.random() - 0.5) * width, (Math.random() - 0.5) * height))];
    }
    removeBoids(num) {
        this.boids.splice(this.boids.length - num, num);
    }
    update(dt, width, height) {
        const forces = this.boids.map((boid) => boid.calcForce(this.boids, width, height));
        this.boids.forEach((boid, i) => boid.update(forces[i], dt));
    }
    draw(ctx) {
        const { width, height } = ctx.canvas;
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.fillStyle = 'blue';
        this.boids.forEach((boid) => boid.draw(ctx));
        ctx.restore();
    }
}
