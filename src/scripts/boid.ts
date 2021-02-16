import RectBorders from './borders';
import flags from './flags';
import Rectangle from './rectangle';
import { mapRange, toRadians } from './utils';
import Vector from './vector';

type CurrentSearch = {
  targetPosition: Vector,
  timeRemaining: number,
};

export enum AppearanceType { Triangle, Image }

export type BoidSettings = Readonly<{
  maxSpeed: number,
  maxForce: number,
  radius: number,
  viewDistance: number,
  separationFactor: number,
  alignmentFactor: number,
  cohesionFactor: number,
  desiredSeparationDistance: number,
  desiredFlockSpeed: number,
  searchTargetReachRadius: number,
  maxSearchTime: number,
  appearance: { type: AppearanceType.Triangle, color: string; } | { type: AppearanceType.Image, image: CanvasImageSource; },
  // TODO add debug drawing settings
}>;

type DebugInfo = {
  slowing: boolean,
};

export default class Boid {
  readonly #settings: BoidSettings;

  #position: Vector;
  #acceleration = new Vector();
  #velocity = new Vector();

  #currentSearch: CurrentSearch | null = null;

  #debugInfo: DebugInfo = {
    slowing: false,
  };

  constructor(position: Vector, settings: BoidSettings) {
    this.#position = position;
    this.#settings = settings;
  }

  static createInRandomPosition(rect: Rectangle, settings: BoidSettings) {
    return new Boid(Vector.randomInRect(rect.withPadding(settings.radius)), settings);
  }

  calcNetForce(dt: number, boids: readonly Boid[], borders: RectBorders) {
    const boidsInView = boids.filter((boid) => boid !== this && this.#position.distLTE(boid.#position, this.#settings.viewDistance));

    const seesBoids = boidsInView.length >= 1;
    if (seesBoids) this.#currentSearch = null;

    const selfAppliedForce = seesBoids ? this.calcFlockForce(boidsInView, dt) : this.calcSearchForce(dt, borders);
    const externalAppliedForce = this.calcBordersForce(borders);
    // TODO dont add random force if they already broke the stalemate (velocity isnt pointing (or opposite...) to the other boids)
    return (boidsInView.length !== 1 ? selfAppliedForce : selfAppliedForce.add(Vector.randomMag(this.#settings.maxForce))).limitMag(this.#settings.maxForce).add(externalAppliedForce);
  }

  private calcFlockForce(boidsInView: Boid[], dt: number) {
    return this.calcSeparationForce(boidsInView, dt).mult(this.#settings.separationFactor)
      .add(this.calcAlignmentForce(boidsInView, dt).mult(this.#settings.alignmentFactor))
      .add(this.calcCohesionForce(boidsInView, dt).mult(this.#settings.cohesionFactor));
  }

  private calcSeparationForce(boidsInView: Boid[], dt: number) {
    // NOTE probably can be improved
    const d = this.#settings.desiredSeparationDistance;
    const forces = boidsInView
      .filter((other) => this.#position.distLT(other.#position, d))
      .map((other) => this.#position.sub(other.#position)
        .withMag(mapRange(this.#position.dist(other.#position), 0, d, this.#settings.maxForce, 0)));
    return Vector.sum(forces).div(dt).limitMag(this.#settings.maxForce);
  }

  private calcAlignmentForce(boidsInView: Boid[], dt: number) {
    const averageHeading = Vector.sum(boidsInView.map((boid) => boid.#velocity.unit()));
    const desiredVelocity = averageHeading.withMag(this.#settings.desiredFlockSpeed);
    return this.calcSteerForce(desiredVelocity, dt);
  }

  private calcCohesionForce(boidsInView: Boid[], dt: number) {
    const averagePosition = Vector.average(boidsInView.map((boid) => boid.#position));
    return this.calcArriveForce(averagePosition, dt);
  }

  private calcSearchForce(dt: number, borders: RectBorders) {
    this.#currentSearch ??= {
      targetPosition: Vector.randomInRect(borders.getFreeZone()),
      timeRemaining: this.#settings.maxSearchTime,
    };
    return this.calcArriveForce(this.#currentSearch.targetPosition, dt);
  }

  private calcBordersForce(borders: RectBorders) {
    return borders.calcForce(this.#position, this.#settings.radius);
  }

  private calcArriveForce(targetPosition: Vector, dt: number) {
    // TODO adjust for 2d
    // currently this has the problem that it assumes you are in a straight line to the target,
    // therefore it slows down before it actually should (lower maxForce to see (because its harder to turn))
    const shouldSlow = this.#position.distLTE(targetPosition, 0.5 * this.#velocity.magSquared() / this.#settings.maxForce + this.#settings.maxSpeed * dt);
    this.#debugInfo.slowing = shouldSlow;
    if (shouldSlow) {
      const forceToApply = 0.5 * this.#velocity.magSquared() / this.#position.dist(targetPosition);
      return this.#velocity.withMag(-forceToApply).limitMag(this.#settings.maxForce);
    }
    const desiredVelocity = targetPosition.sub(this.#position).withMag(this.#settings.maxSpeed);
    return this.calcSteerForce(desiredVelocity, dt);
  }

  /** Calculates the force needed to reach a velocity of `desiredVelocity` in `dt` seconds, limited to `maxForce`. */
  private calcSteerForce(desiredVelocity: Vector, dt: number) {
    return desiredVelocity.sub(this.#velocity).div(dt).limitMag(this.#settings.maxForce);
  }

  update(netForce: Vector, dt: number) {
    this.#acceleration = netForce;
    // Move according to linear motion
    const finalVelocity = this.#velocity.add(this.#acceleration.mult(dt));
    const averageVelocity = this.#velocity.add(finalVelocity).div(2);
    const displacement = averageVelocity.mult(dt);
    this.#velocity = finalVelocity;
    this.#position = this.#position.add(displacement);

    if (this.#currentSearch) {
      this.#currentSearch.timeRemaining -= dt;
      const reachedSearchTarget = this.#position.distLTE(this.#currentSearch.targetPosition, this.#settings.searchTargetReachRadius + this.#settings.radius);
      if (this.#currentSearch.timeRemaining <= 0 || reachedSearchTarget) {
        this.#currentSearch = null;
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
      if (this.#currentSearch) this.drawSearch(ctx, this.#currentSearch);
    }
  }

  private drawBody(ctx: CanvasRenderingContext2D) {
    if (this.#settings.appearance.type === AppearanceType.Triangle) {
      ctx.strokeStyle = this.#settings.appearance.color;
      ctx.lineWidth = 1;

      ctx.save();
      ctx.translate(this.#position.x, this.#position.y);
      ctx.rotate(this.#velocity.angle());
      ctx.beginPath();
      ctx.moveTo(this.#settings.radius, 0);
      const angle = toRadians(150);
      ctx.lineTo(Math.cos(angle) * this.#settings.radius, -Math.sin(angle) * this.#settings.radius);
      ctx.lineTo(Math.cos(-angle) * this.#settings.radius, -Math.sin(-angle) * this.#settings.radius);
      ctx.closePath();
      ctx.restore();

      ctx.stroke();
    } else {
      ctx.drawImage(
        this.#settings.appearance.image,
        this.#position.x - this.#settings.radius,
        this.#position.y - this.#settings.radius,
        2 * this.#settings.radius,
        2 * this.#settings.radius,
      );
    }
  }

  private drawVelocity(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.#debugInfo.slowing ? 'blue'
      : this.#velocity.magGTE(this.#settings.maxSpeed - 1) ? 'red'
        : 'yellow';
    ctx.lineWidth = 50;

    ctx.save();
    ctx.translate(this.#position.x, this.#position.y);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.#velocity.x, this.#velocity.y);
    ctx.restore();

    ctx.stroke();
  }

  private drawAcceleration(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 20;
    ctx.save();
    ctx.translate(this.#position.x + this.#velocity.x / 144, this.#position.y + this.#velocity.y / 144);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.#acceleration.x, this.#acceleration.y);
    ctx.restore();
    ctx.stroke();
  }

  private drawView(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(this.#position.x, this.#position.y, this.#settings.viewDistance, 0, 2 * Math.PI);

    ctx.stroke();
  }

  private drawSearch(ctx: CanvasRenderingContext2D, currentSearch: CurrentSearch) {
    ctx.strokeStyle = '#FA4';
    ctx.fillStyle = '#FA4';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(currentSearch.targetPosition.x, currentSearch.targetPosition.y, 3, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(currentSearch.targetPosition.x, currentSearch.targetPosition.y, this.#settings.searchTargetReachRadius, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(this.#position.x, this.#position.y);
    ctx.lineTo(currentSearch.targetPosition.x, currentSearch.targetPosition.y);
    ctx.stroke();
  }
  // #endregion
}
