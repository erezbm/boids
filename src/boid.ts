import Border from './border.js';
import flags from './flags.js';
import Vector from './vector.js';

export default class Boid {
  private static maxForce = 10;
  private static radius = 5;
  private static viewDistance = 50;

  private acceleration = new Vector();
  private velocity = new Vector();

  public radius = Boid.radius;
  public viewDistance = Boid.viewDistance;

  constructor(public position: Vector) { }

  static createInRandomPosition(width: number, height: number) {
    return new Boid(Vector.randomInRect(Boid.radius, Boid.radius, width - 2 * Boid.radius, height - 2 * Boid.radius));
  }

  calcNetForce(boids: readonly Boid[], borders: readonly Border[]) {
    const boidsInView = boids.filter((boid) => this.position.distLessThan(boid.position, this.viewDistance));

    const seperationForce = this.calcSeperationForce(boidsInView);
    const alignmentForce = this.calcAlignmentForce(boidsInView);
    const cohesionForce = this.calcCohesionForce(boidsInView);
    const bordersForce = this.calcBordersForce(borders);

    return seperationForce.add(alignmentForce).add(cohesionForce).add(bordersForce);
  }

  private calcSeperationForce(boidsInView: Boid[]) {
    return new Vector();
  }

  private calcAlignmentForce(boidsInView: Boid[]) {
    return new Vector();
  }

  private calcCohesionForce(boidsInView: Boid[]) {
    return new Vector();
  }

  private calcBordersForce(borders: readonly Border[]) {
    return borders
      .map((border) => border.calcNormalForce(this.position, this.radius))
      .reduce((sum, current) => sum.add(current));
  }

  update(netForce: Vector, dt: number) {
    this.acceleration = netForce;
    // Move according to linear motion
    const finalVelocity = this.velocity.add(this.acceleration.mult(dt));
    const averageVelocity = this.velocity.add(finalVelocity).div(2);
    const displacement = averageVelocity.mult(dt);
    this.velocity = finalVelocity;
    this.position = this.position.add(displacement);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();

    if (flags.debug) {
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.viewDistance, 0, 2 * Math.PI);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'yellow';
      ctx.stroke();
    }
  }
}
