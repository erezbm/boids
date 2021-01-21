import Border from './border.js';
import flags from './flags.js';
import { toRadians } from './utils.js';
import Vector from './vector.js';

export default class Boid {
  private static radius = 10;
  private static maxForce = 10;
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

    let netForce = Vector.zero;
    if (boidsInView) {
      netForce = netForce.add(this.calcSeperationForce(boidsInView));
      netForce = netForce.add(this.calcAlignmentForce(boidsInView));
      netForce = netForce.add(this.calcCohesionForce(boidsInView));
    } else {
      netForce = netForce.add(this.calcRandomSteerForce());
    }
    netForce = netForce.add(this.calcBordersForce(borders));

    return netForce;
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

  private calcRandomSteerForce() {
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
    ctx.strokeStyle = '#1D2';
    ctx.lineWidth = 1;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.velocity.angle());
    ctx.beginPath();
    ctx.moveTo(this.radius, 0);
    const angle = toRadians(150);
    ctx.lineTo(Math.cos(angle) * this.radius, -Math.sin(angle) * this.radius);
    ctx.lineTo(Math.cos(-angle) * this.radius, -Math.sin(-angle) * this.radius);
    ctx.closePath();
    ctx.restore();
    ctx.stroke();

    if (flags.debug) {
      ctx.strokeStyle = 'yellow';
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.viewDistance, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }
}
