import { BoidSettings, BoidSettingsChanges } from './boid';
import Boids from './boids';
import RectBorders, { RectBordersSettings, RectBordersSettingsChanges } from './borders';
import { OmitSafe } from './utils';

type MySettings = Readonly<{
  backgroundOpacity: number,
  backgroundColor: string,
}>;

type SimulatorSettingsT<T, U extends RectBordersSettings | RectBordersSettingsChanges> = MySettings & Readonly<{
  numberOfBoids: number,
  boid: T,
  borders: OmitSafe<U, 'maxForce'>,
}>;

export type SimulatorSettings = SimulatorSettingsT<BoidSettings, RectBordersSettings>;

/* eslint-disable @typescript-eslint/indent */
export type SimulatorSettingsChanges = Partial<
  SimulatorSettingsT<BoidSettingsChanges, RectBordersSettingsChanges>
>;
/* eslint-enable @typescript-eslint/indent */

export default class Simulator {
  readonly #boids: Boids;
  readonly #borders: RectBorders;

  #mySettings: MySettings = {} as any;

  readonly #context: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, visibleSpace: Element, settings: SimulatorSettings) {
    this.#borders = new RectBorders(visibleSpace, {} as any);
    this.#boids = new Boids({} as any);
    this.#context = canvas.getContext('2d')!;

    this.changeSettings(settings);
  }

  changeSettings(changes: SimulatorSettingsChanges) {
    const { numberOfBoids, backgroundOpacity, backgroundColor, boid, borders } = changes;

    if (backgroundOpacity !== undefined) this.#mySettings = { ...this.#mySettings, backgroundOpacity };
    if (backgroundColor !== undefined) this.#mySettings = { ...this.#mySettings, backgroundColor };
    if (boid !== undefined) {
      this.#boids.changeSettings(boid);
      if (boid.maxForce !== undefined) this.#borders.changeSettings({ maxForce: 2 * boid.maxForce });
      if (boid.appearance !== undefined) this.drawBackground(this.#context, 1);
    }
    if (borders !== undefined) this.#borders.changeSettings(borders);
    // Update numberOfBoids after to take into account the new settings
    if (numberOfBoids !== undefined) this.#boids.setNumberOfBoids(numberOfBoids, this.#borders.getUnaffectedSpace());
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

  private update(dt: number) {
    this.#boids.update(dt, this.#borders);
  }

  private draw(context: CanvasRenderingContext2D) {
    this.drawBackground(context);
    this.#borders.draw(context);
    this.#boids.draw(context);
  }

  private drawBackground(context: CanvasRenderingContext2D, alpha = this.#mySettings.backgroundOpacity) {
    const prevAlpha = context.globalAlpha;
    context.globalAlpha = alpha;
    context.fillStyle = this.#mySettings.backgroundColor;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.globalAlpha = prevAlpha;
  }
}
