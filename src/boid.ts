import RectBorders from './borders.js';
import flags from './flags.js';
import { toRadians } from './utils.js';
import Vector from './vector.js';

type CurrentSearch = null | {
  targetPosition: Vector,
  timeRemaining: number,
};

type DebugInfo = {
  slowing: boolean,
};

export default class Boid {
  public static maxSpeed = 4 * 144;
  public static maxForce = 1 * Boid.maxSpeed;

  public static viewDistance = 50;

  public static radius = 10;

  public acceleration = new Vector();
  public velocity = new Vector();

  public static searchTargetRadius = 15;
  public static searchTime = 50;
  public currentSearch: CurrentSearch = null;

  private debugInfo: DebugInfo = {
    slowing: false,
  };

  constructor(public position: Vector) { }

  static createInRandomPosition(borders: RectBorders) {
    return new Boid(Vector.randomInRect(borders.getFreeZone().withPadding(Boid.radius)));
  }

  calcNetForce(dt: number, boids: readonly Boid[], borders: RectBorders) {
    const boidsInView = boids.filter((boid) => boid !== this && this.position.distLTE(boid.position, Boid.viewDistance));

    const seesBoids = boidsInView.length > 0;
    if (seesBoids) this.currentSearch = null;

    return (seesBoids ? this.calcFlockForce(boidsInView) : this.calcSearchForce(dt, borders)).add(this.calcBordersForce(borders));
  }

  private calcFlockForce(boidsInView: Boid[]) {
    return this.calcSeperationForce(boidsInView)
      .add(this.calcAlignmentForce(boidsInView))
      .add(this.calcCohesionForce(boidsInView));
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

  private calcSearchForce(dt: number, borders: RectBorders) {
    if (!this.currentSearch) {
      this.currentSearch = {
        targetPosition: Vector.randomInRect(borders.getFreeZone()),
        timeRemaining: Boid.searchTime,
      };
    }
    return this.calcArriveForce(this.currentSearch.targetPosition, dt);
  }

  private calcBordersForce(borders: RectBorders) {
    return borders.calcForce(this.position, Boid.radius);
  }

  private calcArriveForce(target: Vector, dt: number) {
    /* TODO adjust for 2d.
     * currently this has the problem that it assumes you are in a straight line to the target,
     * therefore it slows down before it actually should (lower maxForce to see (because its harder to turn)) */
    const shouldSlow = this.position.distLTE(target, 0.5 * this.velocity.magSquared() / Boid.maxForce + Boid.maxSpeed * dt);
    this.debugInfo.slowing = shouldSlow;
    if (shouldSlow) {
      const forceToApply = 0.5 * this.velocity.magSquared() / this.position.dist(target);
      return this.velocity.withMag(-forceToApply).limitMag(Boid.maxForce);
    }
    const desiredVelocity = target.sub(this.position).withMag(Boid.maxSpeed);
    return this.calcSteerForce(desiredVelocity, dt);
  }

  /** Calculates the force needed to reach a velocity of `desiredVelocity` in `dt` seconds, limited to `maxForce`. */
  private calcSteerForce(desiredVelocity: Vector, dt: number) {
    return desiredVelocity.sub(this.velocity).div(dt).limitMag(Boid.maxForce);
  }

  update(netForce: Vector, dt: number) {
    this.acceleration = netForce;
    // Move according to linear motion
    const finalVelocity = this.velocity.add(this.acceleration.mult(dt));
    const averageVelocity = this.velocity.add(finalVelocity).div(2);
    const displacement = averageVelocity.mult(dt);
    this.velocity = finalVelocity;
    this.position = this.position.add(displacement);

    if (this.currentSearch) {
      this.currentSearch.timeRemaining -= dt;
      const reachedSearchTarget = this.position.distLTE(this.currentSearch.targetPosition, Boid.searchTargetRadius + Boid.radius);
      if (this.currentSearch.timeRemaining <= 0 || reachedSearchTarget) {
        this.currentSearch = null;
      }
    }
  }

  // #region Drawing
  draw(ctx: CanvasRenderingContext2D) {
    this.drawBody(ctx);

    if (flags.debug) {
      this.drawVelocity(ctx);
      this.drawAcceleration(ctx);
      this.drawView(ctx);
      if (this.currentSearch) this.drawSearch(ctx, this.currentSearch);
    }
  }

  private drawBody(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = '#1D2';
    ctx.lineWidth = 1;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.velocity.angle());
    ctx.beginPath();
    ctx.moveTo(Boid.radius, 0);
    const angle = toRadians(150);
    ctx.lineTo(Math.cos(angle) * Boid.radius, -Math.sin(angle) * Boid.radius);
    ctx.lineTo(Math.cos(-angle) * Boid.radius, -Math.sin(-angle) * Boid.radius);
    ctx.closePath();
    ctx.restore();

    ctx.stroke();
  }

  private drawVelocity(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.debugInfo.slowing ? 'blue'
      : this.velocity.magGTE(Boid.maxSpeed - 1) ? 'red'
        : 'yellow';
    ctx.lineWidth = 50;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.velocity.x, this.velocity.y);
    ctx.restore();

    ctx.stroke();
  }

  private drawAcceleration(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 20;
    ctx.save();
    ctx.translate(this.position.x + this.velocity.x / 144, this.position.y + this.velocity.y / 144);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.acceleration.x, this.acceleration.y);
    ctx.restore();
    ctx.stroke();
  }

  private drawView(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, Boid.viewDistance, 0, 2 * Math.PI);

    ctx.stroke();
  }

  private drawSearch(ctx: CanvasRenderingContext2D, currentSearch: NonNullable<CurrentSearch>) {
    ctx.strokeStyle = '#FA4';
    ctx.fillStyle = '#FA4';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(currentSearch.targetPosition.x, currentSearch.targetPosition.y, 3, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(currentSearch.targetPosition.x, currentSearch.targetPosition.y, Boid.searchTargetRadius, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(currentSearch.targetPosition.x, currentSearch.targetPosition.y);
    ctx.stroke();
  }
  // #endregion
}
