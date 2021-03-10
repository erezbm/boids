import Rectangle from '../rectangle';
import { mapRange, Mutable, OmitSafe } from '../utils';
import Vector from '../vector';
import { CurrentSearch, IReadonlyBoid, IReadonlyBorders, IReadonlyWorld } from './simulation';

export type BoidsSettings = Readonly<{
  numberOfBoids: number,
  boidsMaxSpeed: number,
  boidsMaxForce: number,
  boidsRadius: number,
  boidsViewDistance: number,
  boidsAngleOfView: number,
  boidsSeparationFactor: number,
  boidsAlignmentFactor: number,
  boidsCohesionFactor: number,
  boidsDesiredSeparationDistance: number,
  boidsDesiredFlockSpeed: number,
  boidsMouseAvoidanceForceFactor: number,
  boidsSearchTargetReachRadius: number,
  boidsMaxSearchTime: number,
}>;

export type BoidsSettingsChange = Partial<OmitSafe<BoidsSettings, 'numberOfBoids'>>;

export default class Boid implements IReadonlyBoid {
  #settings: BoidsSettings;

  #position: Vector;
  #velocity = new Vector();
  #acceleration = new Vector();

  readonly #rainbowAppearanceColor = `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;

  #currentSearch: Mutable<CurrentSearch> | null = null;

  #slowing = false;

  constructor(position: Vector, settings: BoidsSettings) {
    this.#position = position;
    this.#settings = settings;
  }

  get position() { return this.#position; }
  get velocity() { return this.#velocity; }
  get acceleration() { return this.#acceleration; }

  get radius() { return this.#settings.boidsRadius; }

  get maxSpeed() { return this.#settings.boidsMaxSpeed; }
  get maxForce() { return this.#settings.boidsMaxForce; }

  get viewDistance() { return this.#settings.boidsViewDistance; }
  get angleOfView() { return this.#settings.boidsAngleOfView; }

  get currentSearch(): CurrentSearch | null { return this.#currentSearch; }
  get searchTargetReachRadius() { return this.#settings.boidsSearchTargetReachRadius; }
  get maxSearchTime() { return this.#settings.boidsMaxSearchTime; }

  get rainbowAppearanceColor() { return this.#rainbowAppearanceColor; }

  get slowing() { return this.#slowing; }

  static createInRandomPosition(spawnSpace: Rectangle, settings: BoidsSettings) {
    return new Boid(Vector.randomInRect(spawnSpace.withPadding(settings.boidsRadius)), settings);
  }

  calcNetForce(dt: number, { boids, borders, pointer }: IReadonlyWorld) {
    const boidsInView = boids.filter((other) => other !== this && this.isInView(other.position, this.#settings.boidsRadius));

    const seesBoids = boidsInView.length >= 1;
    if (seesBoids) this.#currentSearch = null;

    let selfAppliedForce = seesBoids ? this.calcFlockForce(boidsInView, dt) : this.calcSearchForce(dt, borders);
    if (boidsInView.length === 1 && this.isInStalemateWith(boidsInView[0])) {
      selfAppliedForce = selfAppliedForce.add(Vector.randomMag(this.#settings.boidsMaxForce));
    }
    if (pointer.position !== null && pointer.isDown && this.isInView(pointer.position, 0)) {
      selfAppliedForce = selfAppliedForce.add(this.calcAvoidForce(pointer.position, dt).mult(this.#settings.boidsMouseAvoidanceForceFactor));
    }
    const externalForce = this.calcBordersForce(borders);
    return selfAppliedForce.limitMag(this.#settings.boidsMaxForce).add(externalForce);
  }

  private isInView(otherPosition: Vector, otherRadius: number) {
    if (!this.#position.distLTE(otherPosition, this.#settings.boidsRadius + this.#settings.boidsViewDistance + otherRadius)) return false;
    const angle = otherPosition.sub(this.#position).angle();
    const heading = this.#velocity.angle();
    let diffAngle = angle - heading;
    if (diffAngle > Math.PI) diffAngle -= 2 * Math.PI;
    if (diffAngle < -Math.PI) diffAngle += 2 * Math.PI;
    return -this.#settings.boidsAngleOfView / 2 <= diffAngle && diffAngle <= this.#settings.boidsAngleOfView / 2;
  }

  private isInStalemateWith(other: IReadonlyBoid) {
    return this.#velocity.angle() === other.velocity.neg().angle();
  }

  private calcFlockForce(boidsInView: readonly IReadonlyBoid[], dt: number) {
    return this.calcSeparationForce(boidsInView, dt).mult(this.#settings.boidsSeparationFactor)
      .add(this.calcAlignmentForce(boidsInView, dt).mult(this.#settings.boidsAlignmentFactor))
      .add(this.calcCohesionForce(boidsInView, dt).mult(this.#settings.boidsCohesionFactor));
  }

  private calcSeparationForce(boidsInView: readonly IReadonlyBoid[], dt: number) {
    // NOTE probably can be improved
    const d = this.#settings.boidsDesiredSeparationDistance;
    const forces = boidsInView
      .filter((other) => this.#position.distLT(other.position, d))
      .map((other) => this.#position.sub(other.position)
        .withMag(mapRange(this.#position.dist(other.position), 0, d, this.#settings.boidsMaxForce, 0)));
    return Vector.sum(forces).div(dt).limitMag(this.#settings.boidsMaxForce);
  }

  private calcAlignmentForce(boidsInView: readonly IReadonlyBoid[], dt: number) {
    const averageHeading = Vector.sum(boidsInView.map((boid) => boid.velocity.unit()));
    const desiredVelocity = averageHeading.withMag(this.#settings.boidsDesiredFlockSpeed);
    return this.calcSteerForce(desiredVelocity, dt);
  }

  private calcCohesionForce(boidsInView: readonly IReadonlyBoid[], dt: number) {
    const averagePosition = Vector.average(boidsInView.map((boid) => boid.position));
    return this.calcArriveForce(averagePosition, dt);
  }

  private calcSearchForce(dt: number, borders: IReadonlyBorders) {
    this.#currentSearch ??= {
      targetPosition: Vector.randomInRect(borders.unaffectedBorderedSpace),
      timeRemaining: this.#settings.boidsMaxSearchTime,
    };
    return this.calcArriveForce(this.#currentSearch.targetPosition, dt);
  }

  private calcBordersForce(borders: IReadonlyBorders) {
    return borders.calcForce(this.#position, this.#settings.boidsRadius);
  }

  private calcAvoidForce(position: Vector, dt: number) {
    const f = this.#position.sub(position);
    const distanceSquared = f.magSquared();
    return f.withMag(1 / distanceSquared).div(dt);
  }

  private calcArriveForce(targetPosition: Vector, dt: number) {
    // TODO adjust for 2d
    // currently this has the problem that it assumes you are in a straight line to the target,
    // therefore it slows down before it actually should (lower maxForce to see (because its harder to turn))
    const shouldSlow = this.#position.distLTE(targetPosition, 0.5 * this.#velocity.magSquared() / this.#settings.boidsMaxForce + this.#settings.boidsMaxSpeed * dt);
    this.#slowing = shouldSlow;
    if (shouldSlow) {
      const forceToApply = 0.5 * this.#velocity.magSquared() / this.#position.dist(targetPosition);
      return this.#velocity.withMag(-forceToApply).limitMag(this.#settings.boidsMaxForce);
    }
    const desiredVelocity = targetPosition.sub(this.#position).withMag(this.#settings.boidsMaxSpeed);
    return this.calcSteerForce(desiredVelocity, dt);
  }

  /** Calculates the force needed to reach a velocity of `desiredVelocity` in `dt` seconds, limited to `maxForce`. */
  private calcSteerForce(desiredVelocity: Vector, dt: number) {
    return desiredVelocity.sub(this.#velocity).div(dt).limitMag(this.#settings.boidsMaxForce);
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
      const reachedSearchTarget = this.#position.distLTE(this.#currentSearch.targetPosition, this.#settings.boidsSearchTargetReachRadius + this.#settings.boidsRadius);
      if (this.#currentSearch.timeRemaining <= 0 || reachedSearchTarget) {
        this.#currentSearch = null;
      }
    }
  }

  changeSettings(change: BoidsSettingsChange) {
    this.#settings = { ...this.#settings, ...change };
  }
}
