import Border from './border';
import Rectangle from '../rectangle';
import { filterInvalidKeys } from '../utils';
import Vector from '../vector';
import { IReadonlyBorders } from './simulation';

export type BordersSettings = {
  bordersMaxForce: number,
  bordersEffectDistance: number,
};

export type BordersSettingsChange = Partial<BordersSettings>;

export default class RectBorders implements IReadonlyBorders {
  #settings!: BordersSettings;
  readonly #borders: readonly [Border, Border, Border, Border];

  constructor(public borderedSpace: Rectangle, settings: BordersSettings) {
    const { bordersMaxForce: maxForce, bordersEffectDistance: effectDistance } = settings;
    this.#borders = [
      new Border(new Vector(1, 0), (p, r) => (p.x - r) - this.borderedSpace.x, maxForce, effectDistance), // Left border
      new Border(new Vector(0, 1), (p, r) => (p.y - r) - this.borderedSpace.y, maxForce, effectDistance), // Upper border
      new Border(new Vector(-1, 0), (p, r) => (this.borderedSpace.x + this.borderedSpace.width) - (p.x + r), maxForce, effectDistance), // Right border
      new Border(new Vector(0, -1), (p, r) => (this.borderedSpace.y + this.borderedSpace.height) - (p.y + r), maxForce, effectDistance), // Lower border
    ] as const;

    this.changeSettings(settings);
  }

  get unaffectedBorderedSpace() { return this.borderedSpace.withPadding(this.#settings.bordersEffectDistance); }

  get settings(): BordersSettings { return this.#settings; }

  calcForce(position: Vector, radius: number) {
    return this.#borders
      .map((border) => border.calcNormalForce(position, radius))
      .reduce((sum, current) => sum.add(current));
  }

  private static readonly settingsKeys: readonly (keyof BordersSettingsChange)[] = ['bordersMaxForce', 'bordersEffectDistance'];
  changeSettings(change: BordersSettingsChange) {
    const filteredChange = filterInvalidKeys(change, RectBorders.settingsKeys);
    this.#settings = { ...this.#settings, ...filteredChange };
    this.#borders.forEach((border) => {
      /* eslint-disable no-param-reassign */
      if (change.bordersMaxForce !== undefined) border.maxForce = change.bordersMaxForce;
      if (change.bordersEffectDistance !== undefined) border.effectDistance = change.bordersEffectDistance;
      /* eslint-enable no-param-reassign */
    });
  }

  attachTo(element: Element) {
    const updateSpace = () => {
      const { x, y, width, height } = element.getBoundingClientRect();
      this.borderedSpace = new Rectangle(x, y, width, height);
    };
    new ResizeObserver(updateSpace).observe(element);
    updateSpace();
  }
}
