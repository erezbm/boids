import Boid from './boid.js';
export default class Flock {
    constructor(numBoids, borders) {
        // TODO use a quadtree instead for performance
        this.boids = [];
        this.addBoids(numBoids, borders);
    }
    addBoids(amount, borders) {
        this.boids = [
            ...this.boids,
            ...Array.from({ length: amount }, () => Boid.createInRandomPosition(borders)),
        ];
    }
    removeBoids(amount) {
        this.boids.splice(this.boids.length - amount, amount);
    }
    update(dt, borders) {
        const netForces = this.boids.map((boid) => boid.calcNetForce(dt, this.boids, borders));
        this.boids.forEach((boid, i) => boid.update(netForces[i], dt));
    }
    draw(ctx) {
        ctx.fillStyle = 'blue';
        this.boids.forEach((boid) => boid.draw(ctx));
    }
}
