import Rectangle from '../rectangle';
import vector from '../vector';
import { BoidsSettings } from './boid';
import Boids from './boids';
import RectBorders, { BordersSettings } from './borders';
import Pointer from './pointer';
import { IReadonlyWorld } from './simulation';

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

  setVisibleSpace(visibleSpace: Rectangle) { this.#borders.borderedSpace = visibleSpace; }
  setPointerPosition(position: vector | null) { this.#pointer.position = position; }
  setPointerIsDown(isDown: boolean) { this.#pointer.isDown = isDown; }

  changeSettings(change: WorldSettingsChange) {
    this.#boids.changeSettings(change);
    this.#borders.changeSettings(change);
    if (change.numberOfBoids !== undefined) {
      this.#boids.setNumberOfBoids(change.numberOfBoids, this.#borders.unaffectedBorderedSpace);
    }
  }
}
