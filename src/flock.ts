import Boid from './boid.js';
import Border from './border.js';

export default class Flock {
  private boids: Boid[] = [];

  constructor(numBoids: number, width: number, height: number) {
    this.addBoids(numBoids, width, height);
  }

  addBoids(num: number, width: number, height: number) {
    this.boids = [
      ...this.boids,
      ...Array.from({ length: num }, () => Boid.createInRandomPosition(width, height)),
    ];
  }

  removeBoids(num: number) {
    this.boids.splice(this.boids.length - num, num);
  }

  update(dt: number, borders: readonly Border[]) {
    const netForces = this.boids.map((boid) => boid.calcNetForce(this.boids, borders));
    this.boids.forEach((boid, i) => boid.update(netForces[i], dt));
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'blue';
    this.boids.forEach((boid) => boid.draw(ctx));
  }
}