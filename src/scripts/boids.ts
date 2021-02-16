import Boid, { BoidSettings } from './boid';
import RectBorders from './borders';
import Rectangle from './rectangle';

export default class Boids {
  // TODO use a quadtree instead for performance
  #boids: Boid[] = [];

  readonly #boidSettings: BoidSettings;

  constructor(boidSettings: BoidSettings) {
    this.#boidSettings = boidSettings;
  }

  get numberOfBoids() { return this.#boids.length; }

  setNumberOfBoids(numberOfBoids: number, rect: Rectangle) {
    if (numberOfBoids > this.#boids.length) {
      this.#boids = [
        ...this.#boids,
        ...Array.from({ length: numberOfBoids - this.#boids.length }, () => Boid.createInRandomPosition(rect, this.#boidSettings)),
      ];
    } else if (numberOfBoids < this.#boids.length) {
      this.#boids.splice(numberOfBoids, this.#boids.length - numberOfBoids);
    }
  }

  update(dt: number, borders: RectBorders) {
    const netForces = this.#boids.map((boid) => boid.calcNetForce(dt, this.#boids, borders));
    this.#boids.forEach((boid, i) => boid.update(netForces[i], dt));
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'blue';
    this.#boids.forEach((boid) => boid.draw(ctx));
  }
}
