import Boid, { BoidsSettings, BoidsSettingsChange } from './boid';
import Rectangle from '../rectangle';
import { filterInvalidKeys, OmitSafe } from '../utils';
import { IReadonlyBoid, IReadonlyWorld } from './simulation';

export default class Boids {
  #boids: Boid[] = [];

  #settings: BoidsSettings;

  constructor(boidsSettings: OmitSafe<BoidsSettings, 'numberOfBoids'>) {
    this.#settings = { numberOfBoids: 0, ...boidsSettings };
  }

  get array(): readonly IReadonlyBoid[] { return this.#boids; }

  setNumberOfBoids(numberOfBoids: number, spawnSpace: Rectangle) {
    if (numberOfBoids > this.#boids.length) {
      this.#boids = [
        ...this.#boids,
        ...Array.from({ length: numberOfBoids - this.#boids.length }, () => Boid.createInRandomPosition(spawnSpace, this.#settings)),
      ];
    } else if (numberOfBoids < this.#boids.length) {
      this.#boids.splice(numberOfBoids, this.#boids.length - numberOfBoids);
    }
  }

  get settings(): BoidsSettings { return this.#settings; }

  update(dt: number, world: IReadonlyWorld) {
    const netForces = this.#boids.map((boid) => boid.calcNetForce(dt, world));
    this.#boids.forEach((boid, i) => boid.update(netForces[i], dt));
  }

  private static readonly settingsKeys: readonly (keyof BoidsSettingsChange)[] = [
    'boidsMaxSpeed',
    'boidsMaxForce',
    'boidsRadius',
    'boidsViewDistance',
    'boidsAngleOfView',
    'boidsSeparationFactor',
    'boidsAlignmentFactor',
    'boidsCohesionFactor',
    'boidsDesiredSeparationDistance',
    'boidsDesiredFlockSpeed',
    'boidsMouseAvoidanceForceFactor',
    'boidsSearchTargetReachRadius',
    'boidsMaxSearchTime',
  ];

  changeSettings(change: BoidsSettingsChange) {
    const filteredChange = filterInvalidKeys(change, Boids.settingsKeys);
    this.#settings = { ...this.#settings, ...filteredChange };
    this.#boids.forEach((boid) => {
      boid.changeSettings(filteredChange);
    });
  }
}
