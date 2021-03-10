import Rectangle from '../rectangle';
import { BoidsSettings } from './boid';
import Boids from './boids';
import RectBorders, { BordersSettings } from './borders';
import Pointer from './pointer';
import { IReadonlyWorld, PointerChange } from './simulation';

export type WorldSettings = BoidsSettings & BordersSettings;

export type WorldSettingsChange = Partial<WorldSettings>;

export default class World implements IReadonlyWorld {
  readonly #boids: Boids;
  readonly #borders: RectBorders;
  readonly #pointer: Pointer;

  constructor(visibleSpace: Rectangle, settings: WorldSettings) {
    this.#boids = new Boids({} as any);
    this.#borders = new RectBorders(visibleSpace, {} as any);
    this.#pointer = new Pointer();
    this.changeSettings(settings);
  }

  get boids() { return this.#boids.array; }
  get borders() { return this.#borders; }
  get pointer() { return this.#pointer; }

  get settings(): WorldSettings { return { ...this.#boids.settings, ...this.#borders.settings }; }

  update(dt: number) {
    this.#boids.update(dt, this);
  }

  onVisibleSpaceChanged(visibleSpace: Rectangle) {
    this.#borders.borderedSpace = visibleSpace;
  }

  onPointerChanged({ position, isDown }: PointerChange) {
    if (position !== undefined) this.#pointer.position = position;
    if (isDown !== undefined) this.#pointer.isDown = isDown;
  }

  changeSettings(change: WorldSettingsChange) {
    this.#boids.changeSettings(change);
    this.#borders.changeSettings(change);
    if (change.numberOfBoids !== undefined) {
      this.#boids.setNumberOfBoids(change.numberOfBoids, this.#borders.unaffectedBorderedSpace);
    }
  }
}
