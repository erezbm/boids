import Border from './border.js';
import Rectangle from './rectangle.js';
import Vector from './vector.js';

export default class RectBorders {
  public static effectPadding = 50;

  private spaceRect = Rectangle.zero;

  readonly borders: readonly [Border, Border, Border, Border];

  constructor(space?: Rectangle | Element) {
    if (space instanceof Rectangle) this.setSpaceFromRect(space);
    else if (space instanceof Element) this.attachTo(space);

    this.borders = [
      new Border(new Vector(1, 0), RectBorders.effectPadding, (p, r) => (p.x - r) - this.spaceRect.x), // Left border
      new Border(new Vector(0, 1), RectBorders.effectPadding, (p, r) => (p.y - r) - this.spaceRect.y), // Upper border
      new Border(new Vector(-1, 0), RectBorders.effectPadding, (p, r) => (this.spaceRect.x + this.spaceRect.width) - (p.x + r)), // Right border
      new Border(new Vector(0, -1), RectBorders.effectPadding, (p, r) => (this.spaceRect.y + this.spaceRect.height) - (p.y + r)), // Lower border
    ] as const;
  }

  // TODO abstract figuring the space rect of the world into a mutable class and use it here and everywhere else
  getSpaceRect() { return this.spaceRect; }
  setSpaceFromRect(spaceRect: Rectangle) { this.spaceRect = spaceRect; }

  attachTo(element: Element) {
    const updateSpace = () => {
      const { x, y, width, height } = element.getBoundingClientRect();
      this.setSpaceFromRect(new Rectangle(x, y, width, height));
    };
    new ResizeObserver(updateSpace).observe(element);
    updateSpace();
  }

  getFreeZone() { return this.spaceRect.withPadding(RectBorders.effectPadding); }

  calcForce(position: Vector, radius: number) {
    return this.borders
      .map((border) => border.calcNormalForce(position, radius))
      .reduce((sum, current) => sum.add(current));
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { x, y, width, height } = this.spaceRect;

    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      x + RectBorders.effectPadding,
      y + RectBorders.effectPadding,
      width - 2 * RectBorders.effectPadding,
      height - 2 * RectBorders.effectPadding,
    );
  }
}
