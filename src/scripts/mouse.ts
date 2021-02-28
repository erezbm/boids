import { filterUndefinedProps } from './utils';
import Vector from './vector';

export type MouseSettings = Readonly<{
  color: string,
  radius: number,
}>;

export type MouseSettingsChanges = Partial<MouseSettings>;

export default class Mouse {
  #position: Vector | null = null;
  #isDown = false;

  #settings: MouseSettings;

  constructor(visibleSpaceElement: HTMLElement, settings: MouseSettings) {
    this.#settings = settings;

    visibleSpaceElement.addEventListener('mouseenter', ({ clientX, clientY }) => { this.#position = new Vector(clientX, clientY); });
    visibleSpaceElement.addEventListener('mousemove', ({ clientX, clientY }) => { this.#position = new Vector(clientX, clientY); });
    visibleSpaceElement.addEventListener('mouseleave', () => { this.#position = null; });
    visibleSpaceElement.addEventListener('mousedown', () => { this.#isDown = true; });
    visibleSpaceElement.addEventListener('mouseup', () => { this.#isDown = false; });
  }

  get position() { return this.#position; }
  get isDown() { return this.#isDown; }

  changeSettings(changes: MouseSettingsChanges) {
    this.#settings = { ...this.#settings, ...filterUndefinedProps(changes) };
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.#position === null || !this.#isDown) return;

    ctx.fillStyle = this.#settings.color;

    ctx.beginPath();
    ctx.arc(this.#position.x, this.#position.y, this.#settings.radius, 0, 2 * Math.PI);

    ctx.fill();
  }
}
