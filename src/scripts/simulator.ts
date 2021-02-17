import { BoidSettings } from './boid';
import Boids from './boids';
import RectBorders, { RectBordersSettings } from './borders';
import { Mutable, OmitSafe, ReplacePropertyType } from './utils';

type MutableSimulatorSettings = {
  backgroundOpacity: number,
};

export type SimulatorSettings = Readonly<MutableSimulatorSettings & {
  numberOfBoids: number,
  boid: BoidSettings,
  borders: OmitSafe<RectBordersSettings, 'maxForce'>,
}>;

/* eslint-disable @typescript-eslint/indent */
// If typescript had higher-order types we could have SimulatorSettings<Partial> instead
export type PartialSimulatorSettings = Partial<
  ReplacePropertyType<ReplacePropertyType<
    SimulatorSettings,
    'boid', Partial<SimulatorSettings['boid']>>,
    'borders', Partial<SimulatorSettings['borders']>>
>;
/* eslint-enable @typescript-eslint/indent */

export default class Simulator {
  #settings: MutableSimulatorSettings;

  readonly #boids: Boids;
  readonly #borders: RectBorders;

  readonly #bordersSettings: Mutable<RectBordersSettings>;
  readonly #boidSettings: Mutable<BoidSettings>;

  readonly #context: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, visibleSpace: Element, settings: SimulatorSettings) {
    this.#settings = settings;

    this.#bordersSettings = {
      maxForce: 2 * settings.boid.maxForce,
      effectDistance: settings.borders.effectDistance,
      drawEffectDistance: settings.borders.drawEffectDistance,
    };
    this.#borders = new RectBorders(visibleSpace, this.#bordersSettings);

    this.#boidSettings = settings.boid;
    this.#boids = new Boids(this.#boidSettings);

    this.numberOfBoids = settings.numberOfBoids;

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

  updateSettings(settings: PartialSimulatorSettings) {
    const s = settings;
    if (s.numberOfBoids !== undefined) this.numberOfBoids = s.numberOfBoids;
    this.#settings = { ...this.#settings, ...settings };
    if (s.boid !== undefined) this.updateBoidSettings(s.boid);
    if (s.borders !== undefined) this.updateBordersSettings(s.borders);
  }

  private updateBoidSettings(boidSettings: Partial<SimulatorSettings['boid']>) {
    Object.entries(boidSettings).forEach(([key, value]) => {
      if (value !== undefined) (this.#boidSettings as any)[key] = value;
    });
    this.#bordersSettings.maxForce = 2 * this.#boidSettings.maxForce;
  }

  private updateBordersSettings(bordersSettings: Partial<SimulatorSettings['borders']>) {
    Object.entries(bordersSettings).forEach(([key, value]) => {
      if (value !== undefined) (this.#bordersSettings as any)[key] = value;
    });
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
