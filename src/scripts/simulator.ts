import { BoidSettings, BoidSettingsChanges } from './boid';
import Boids from './boids';
import RectBorders, { RectBordersSettings, RectBordersSettingsChanges } from './borders';
import Mouse, { MouseSettings, MouseSettingsChanges } from './mouse';

type MySettings = {
  backgroundOpacity: number,
  backgroundColor: string,
};

type SimulatorSettingsOrChanges<IsSettings extends boolean> = Readonly<MySettings> & Readonly<{
  numberOfBoids: number,
  boid: IsSettings extends true ? BoidSettings : BoidSettingsChanges,
  borders: IsSettings extends true ? RectBordersSettings : RectBordersSettingsChanges,
  mouse: IsSettings extends true ? MouseSettings : MouseSettingsChanges,
}>;

export type SimulatorSettings = SimulatorSettingsOrChanges<true>;

export type SimulatorSettingsChanges = Partial<SimulatorSettingsOrChanges<false>>;

export default class Simulator {
  readonly #boids: Boids;
  readonly #borders: RectBorders;
  readonly #mouse: Mouse;

  #mySettings: MySettings = {} as any;

  readonly #context: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, visibleSpace: HTMLElement, settings: SimulatorSettings) {
    this.#borders = new RectBorders(visibleSpace, {} as any);
    this.#boids = new Boids({} as any);
    this.#mouse = new Mouse(visibleSpace, {} as any);
    this.#context = canvas.getContext('2d')!;

    this.changeSettings(settings);
  }

  changeSettings(changes: SimulatorSettingsChanges) {
    const { numberOfBoids, backgroundOpacity, backgroundColor, boid, borders, mouse } = changes;

    if (backgroundOpacity !== undefined) this.#mySettings.backgroundOpacity = backgroundOpacity;
    if (backgroundColor !== undefined) this.#mySettings.backgroundColor = backgroundColor;
    if (boid !== undefined) {
      this.#boids.changeSettings(boid);
      if (boid.appearance !== undefined) this.drawBackground(this.#context, 1);
    }
    if (borders !== undefined) this.#borders.changeSettings(borders);
    if (mouse !== undefined) this.#mouse.changeSettings(mouse);
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
    this.#boids.update(dt, this.#borders, this.#mouse);
  }

  private draw(context: CanvasRenderingContext2D) {
    this.drawBackground(context);
    this.#borders.draw(context);
    this.#boids.draw(context);
    this.#mouse.draw(context);
  }

  private drawBackground(context: CanvasRenderingContext2D, alpha = this.#mySettings.backgroundOpacity) {
    const prevAlpha = context.globalAlpha;
    context.globalAlpha = alpha;
    context.fillStyle = this.#mySettings.backgroundColor;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.globalAlpha = prevAlpha;
  }
}
