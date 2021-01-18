import Vector from './vector.js';

export default class Boid {
  private static RADIUS = 2;

  public radius = Boid.RADIUS;

  constructor(public x: number, public y: number) { }

  static createInRandomPosition(width: number, height: number) {
    const radius = Boid.RADIUS;
    return new Boid(
      radius + Math.random() * (width - 2 * radius),
      radius + Math.random() * (height - 2 * radius),
    );
  }

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
