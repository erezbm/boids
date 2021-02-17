import { BoidSettings } from './boid';
import Boids from './boids';
import RectBorders, { RectBordersSettings } from './borders';
import { Mutable, OmitSafe } from './utils';

export type SimulatorSettings = Readonly<{
  numberOfBoids: number,
  backgroundOpacity: number,
  boid: BoidSettings,
  borders: OmitSafe<RectBordersSettings, 'maxForce'>,
}>;

export default class Simulator {
  #settings: SimulatorSettings;

  readonly #bordersSettings: Mutable<RectBordersSettings>;

  readonly #boids: Boids;
  readonly #borders: RectBorders;

  readonly #context: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, visibleSpace: Element, settings: SimulatorSettings) {
    this.#settings = settings;
    this.#bordersSettings = {
      maxForce: 2 * this.#settings.boid.maxForce,
      effectDistance: this.#settings.borders.effectDistance,
      drawEffectDistance: this.#settings.borders.drawEffectDistance,
    };

    this.#borders = new RectBorders(visibleSpace, this.#bordersSettings);
    this.#boids = new Boids(this.#settings.boid);
    this.numberOfBoids = this.#settings.numberOfBoids;
    this.#context = canvas.getContext('2d')!;
  }

  get numberOfBoids() { return this.#boids.numberOfBoids; }
  set numberOfBoids(numberOfBoids: number) { this.#boids.setNumberOfBoids(numberOfBoids, this.#borders.getFreeZone()); }

  #requestId: number | null = null;
  start() {
    if (this.#requestId !== null) return;

    let lastUpdateTime = performance.now();
    const callback = () => {
      const time = performance.now();
      const dt = Math.min((time - lastUpdateTime) / 1000, 1 / 15); // limit the time between updates if it is running slow
      this.update(dt);
      lastUpdateTime = time;
      this.draw(this.#context);
      this.#requestId = requestAnimationFrame(callback);
    };
    this.#requestId = requestAnimationFrame(callback);
  }

  stop() {
    if (this.#requestId === null) return;

    cancelAnimationFrame(this.#requestId);
    this.#requestId = null;
  }

  updateSettings(settings: Partial<SimulatorSettings>) {
    // TODO
  }

  private update(dt: number) {
    this.#boids.update(dt, this.#borders);
  }

  private draw(context: CanvasRenderingContext2D) {
    Simulator.drawBackground(context);
    this.#borders.draw(context);
    this.#boids.draw(context);
  }

  private static drawBackground(context: CanvasRenderingContext2D) {
    // context.fillStyle = '#2224';
    context.fillStyle = '#222';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  }
}
