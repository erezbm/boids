import Boids from './boids';
import RectBorders from './borders';
import flags from './flags';

export default class Simulator {
  #boids: Boids;
  #borders: RectBorders;

  #context: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, visibleSpace: Element) {
    this.#borders = new RectBorders(visibleSpace);
    this.#boids = new Boids();
    this.#context = canvas.getContext('2d')!;
  }

  get numberOfBoids() { return this.#boids.numberOfBoids; }
  set numberOfBoids(numberOfBoids: number) { this.#boids.setNumberOfBoids(numberOfBoids, this.#borders); }

  private requestId: number | null = null;
  start() {
    if (this.requestId !== null) return;

    let lastUpdateTime = performance.now();
    const callback = () => {
      const time = performance.now();
      const dt = Math.min(time - lastUpdateTime, 1000 / 15) / 1000; // limit the time between updates if it is running slow
      this.update(dt);
      lastUpdateTime = time;
      this.draw(this.#context);
      this.requestId = requestAnimationFrame(callback);
    };
    this.requestId = requestAnimationFrame(callback);
  }

  stop() {
    if (this.requestId === null) return;

    cancelAnimationFrame(this.requestId);
    this.requestId = null;
  }

  update(dt: number) {
    this.#boids.update(dt, this.#borders);
  }

  draw(context: CanvasRenderingContext2D) {
    Simulator.drawBackground(context);
    if (flags.debug) {
      this.#borders.draw(context);
    }
    this.#boids.draw(context);
  }

  private static drawBackground(context: CanvasRenderingContext2D) {
    // context.fillStyle = '#2224';
    context.fillStyle = '#222';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  }
}
