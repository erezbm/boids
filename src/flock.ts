import Boid from './boid.js';
import RectBorders from './borders.js';

export default class Flock {
  // TODO use a quadtree instead for performance
  private boids: Boid[] = [];

  constructor(numBoids: number, borders: RectBorders) {
    this.addBoids(numBoids, borders);
  }

  addBoids(amount: number, borders: RectBorders) {
    this.boids = [
      ...this.boids,
      ...Array.from({ length: amount }, () => Boid.createInRandomPosition(borders)),
    ];
  }

  removeBoids(amount: number) {
    this.boids.splice(this.boids.length - amount, amount);
  }

  update(dt: number, borders: RectBorders) {
    const netForces = this.boids.map((boid) => boid.calcNetForce(dt, this.boids, borders));
    this.boids.forEach((boid, i) => boid.update(netForces[i], dt));
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'blue';
    this.boids.forEach((boid) => boid.draw(ctx));
  }
}
