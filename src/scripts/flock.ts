import Boid from './boid';
import RectBorders from './borders';

export default class Flock {
  // TODO use a quadtree instead for performance
  private boids: Boid[] = [];

  get numBoids() { return this.boids.length; }

  constructor(numBoids: number, borders: RectBorders) {
    this.setNumBoids(numBoids, borders);
  }

  setNumBoids(numBoids: number, borders: RectBorders) {
    if (numBoids > this.boids.length) {
      this.boids = [
        ...this.boids,
        ...Array.from({ length: numBoids - this.boids.length }, () => Boid.createInRandomPosition(borders)),
      ];
    } else if (numBoids < this.boids.length) {
      this.boids.splice(numBoids, this.boids.length - numBoids);
    }
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
