import Border, { BorderSettings } from './border';
import flags from './flags';
import Rectangle from './rectangle';
import Vector from './vector';

export type RectBordersSettings = BorderSettings & {
  // TODO add debug drawing settings
};

export default class RectBorders {
  readonly #settings: RectBordersSettings;

  #spaceRect = Rectangle.zero;

  readonly #borders: readonly [Border, Border, Border, Border];

  constructor(space: Rectangle | Element, settings: RectBordersSettings) {
    if (space instanceof Rectangle) this.setSpaceFromRect(space);
    else if (space instanceof Element) this.attachTo(space);
    this.#settings = settings;

    this.#borders = [
      new Border(new Vector(1, 0), (p, r) => (p.x - r) - this.#spaceRect.x, settings), // Left border
      new Border(new Vector(0, 1), (p, r) => (p.y - r) - this.#spaceRect.y, settings), // Upper border
      new Border(new Vector(-1, 0), (p, r) => (this.#spaceRect.x + this.#spaceRect.width) - (p.x + r), settings), // Right border
      new Border(new Vector(0, -1), (p, r) => (this.#spaceRect.y + this.#spaceRect.height) - (p.y + r), settings), // Lower border
    ] as const;
  }

  // TODO abstract figuring the space rect of the world into a mutable class and use it here and everywhere else
  getSpaceRect() { return this.#spaceRect; }
  setSpaceFromRect(spaceRect: Rectangle) { this.#spaceRect = spaceRect; }

  attachTo(element: Element) {
    const updateSpace = () => {
      const { x, y, width, height } = element.getBoundingClientRect();
      this.setSpaceFromRect(new Rectangle(x, y, width, height));
    };
    new ResizeObserver(updateSpace).observe(element);
    updateSpace();
  }

  getFreeZone() { return this.#spaceRect.withPadding(this.#settings.effectDistance); }

  calcForce(position: Vector, radius: number) {
    return this.#borders
      .map((border) => border.calcNormalForce(position, radius))
      .reduce((sum, current) => sum.add(current));
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!flags.debug) return;

    const { x, y, width, height } = this.#spaceRect;
    const { effectDistance } = this.#settings;

    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      x + effectDistance,
      y + effectDistance,
      width - 2 * effectDistance,
      height - 2 * effectDistance,
    );
  }
}
