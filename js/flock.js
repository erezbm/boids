import Boid from './boid.js';
export default class Flock {
    constructor(numBoids, width, height) {
        this.boids = [];
        this.addBoids(numBoids, width, height);
    }
    addBoids(num, width, height) {
        this.boids = [
            ...this.boids,
            ...Array.from({ length: num }, () => Boid.createInRandomPosition(width, height)),
        ];
    }
    removeBoids(num) {
        this.boids.splice(this.boids.length - num, num);
    }
    update(dt, borders) {
        const netForces = this.boids.map((boid) => boid.calcNetForce(this.boids, borders));
        this.boids.forEach((boid, i) => boid.update(netForces[i], dt));
    }
    draw(ctx) {
        ctx.fillStyle = 'blue';
        this.boids.forEach((boid) => boid.draw(ctx));
    }
}
