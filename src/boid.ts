import Vector from './vector.js';

export default class Boid {
  public radius = 2;

  constructor(public x: number, public y: number) { }

  calcForce(boids: readonly Boid[], width: number, height: number): Vector {
    return { x: 0, y: 0 };
  }

  update(force: Vector, dt: number) {
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
  }
}
