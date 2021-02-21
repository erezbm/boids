import { BoidSettings } from './boid';
import Boids from './boids';
import RectBorders, { RectBordersSettings } from './borders';
import { Mutable, OmitSafe, ReplacePropertyType } from './utils';

type SimulatorSpecificSettings = {
  backgroundOpacity: number,
};

export type SimulatorSettings = Readonly<SimulatorSpecificSettings & {
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
  readonly #boids: Boids;
  readonly #borders: RectBorders;

  #settings: SimulatorSpecificSettings = {} as any;
  readonly #bordersSettings: Mutable<RectBordersSettings> = {} as any;
  readonly #boidSettings: Mutable<BoidSettings> = {} as any;

  readonly #context: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, visibleSpace: Element, settings: SimulatorSettings) {
    this.#borders = new RectBorders(visibleSpace, this.#bordersSettings);
    this.#boids = new Boids(this.#boidSettings);
    this.#context = canvas.getContext('2d')!;

    this.updateSettings(settings);
  }

  get settings(): SimulatorSettings {
    return {
      numberOfBoids: this.#boids.numberOfBoids,
      backgroundOpacity: this.#settings.backgroundOpacity,
      boid: this.#boidSettings,
      borders: this.#bordersSettings,
    };
  }

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
    if (s.backgroundOpacity !== undefined) this.#settings.backgroundOpacity = s.backgroundOpacity;
    if (s.boid !== undefined) this.updateBoidSettings(s.boid);
    if (s.borders !== undefined) this.updateBordersSettings(s.borders);
    // Update numberOfBoids after to take into account the new settings
    if (s.numberOfBoids !== undefined) this.#boids.setNumberOfBoids(s.numberOfBoids, this.#borders.getFreeZone());
  }

  private updateBoidSettings(boidSettings: Partial<SimulatorSettings['boid']>) {
    Object.entries(boidSettings).forEach(([key, value]) => {
      if (value !== undefined) (this.#boidSettings as any)[key] = value;
    });
    if (boidSettings.maxForce !== undefined) this.#bordersSettings.maxForce = 2 * boidSettings.maxForce;
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
    this.drawBackground(context);
    this.#borders.draw(context);
    this.#boids.draw(context);
  }

  private drawBackground(context: CanvasRenderingContext2D) {
    const prevAlpha = context.globalAlpha;
    context.globalAlpha = this.#settings.backgroundOpacity;
    context.fillStyle = '#222';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.globalAlpha = prevAlpha;
  }
}
