import type { EventEmitter } from 'events';
import type StrictEventEmitter from 'strict-event-emitter-types';
import Color from '../color';
import Rectangle from '../rectangle';
import Vector from '../vector';
import World, { WorldSettings, WorldSettingsChange } from './world';

export default class Simulation {
  #world: World;
  #view: ISimulationView;
  #drawSettings: DrawSettings;

  constructor(view: ISimulationView, { worldSettings, drawSettings }: SimulationSettings) {
    this.#world = new World(view.visibleSpace, worldSettings);
    this.#view = view;
    this.#drawSettings = { ...drawSettings };

    this.#view.addListener('visibleSpaceChanged', (v) => { this.#world.setVisibleSpace(v); });
    this.#view.addListener('pointerChanged', ({ position, isDown }) => {
      if (position !== undefined) this.#world.setPointerPosition(position);
      if (isDown !== undefined) this.#world.setPointerIsDown(isDown);
    });
  }

  #requestId: number | null = null;
  start() {
    if (this.#requestId !== null) return;

    let lastUpdateTime = performance.now();
    const callback = () => {
      const time = performance.now();
      const dt = Math.min((time - lastUpdateTime) / 1000, 1 / 15); // limit the time between updates if it is running slow
      this.#world.update(dt);
      lastUpdateTime = time;

      this.#view.drawWorld(this.#world, this.#drawSettings);

      this.#requestId = requestAnimationFrame(callback);
    };
    this.#requestId = requestAnimationFrame(callback);
  }

  stop() {
    if (this.#requestId === null) return;

    cancelAnimationFrame(this.#requestId);
    this.#requestId = null;
  }

  changeSettings({ worldSettingsChange, drawSettingsChange }: SimulationSettingsChange) {
    if (worldSettingsChange !== undefined) {
      this.#world.changeSettings(worldSettingsChange);
    }

    this.#drawSettings = { ...this.#drawSettings, ...drawSettingsChange };
    if (drawSettingsChange?.boidsAppearance !== undefined) this.#view.fillBackground(this.#drawSettings.backgroundColor);
  }

  get settings(): SimulationSettings { return { worldSettings: this.#world.settings, drawSettings: this.#drawSettings }; }
}

export type SimulationSettings = Readonly<{
  worldSettings: WorldSettings,
  drawSettings: DrawSettings,
}>;

export type SimulationSettingsChange = Partial<Readonly<{
  worldSettingsChange: WorldSettingsChange,
  drawSettingsChange: DrawSettingsChange,
}>>;

// #region Simulation View Interface
export type ISimulationView = StrictEventEmitter<EventEmitter, ISimulationViewEvents> & Readonly<{
  visibleSpace: Rectangle,

  drawWorld(world: IReadonlyWorld, settings: DrawSettings): void,
  fillBackground(color: Color): void,
}>;

export type ISimulationViewEvents = {
  'visibleSpaceChanged': (visibleSpace: Rectangle) => void,
  'pointerChanged': (pointerChange: PointerChange) => void,
};

export type PointerChange = Readonly<{ position?: Vector | null, isDown?: boolean; }>;

export type IReadonlyWorld = Readonly<{
  boids: readonly IReadonlyBoid[],
  borders: IReadonlyBorders,
  pointer: IReadonlyPointer,
}>;

export type IReadonlyBoid = Readonly<{
  position: Vector,
  velocity: Vector,
  acceleration: Vector,

  radius: number,

  maxSpeed: number,
  maxForce: number,

  viewDistance: number,
  angleOfView: number,

  currentSearch: CurrentSearch | null,
  searchTargetReachRadius: number,
  maxSearchTime: number,

  rainbowAppearanceColor: Color,
  slowing: boolean,
}>;

export type CurrentSearch = Readonly<{
  targetPosition: Vector,
  timeRemaining: number,
}>;

export type IReadonlyBorders = Readonly<{
  borderedSpace: Rectangle,
  unaffectedBorderedSpace: Rectangle,
  calcForce(position: Vector, radius: number): Vector,
}>;

export type IReadonlyPointer = Readonly<{
  position: Vector | null,
  isDown: boolean,
}>;
// #endregion

// #region Draw Settings
export type DrawSettings = BoidsDrawSettings & BordersDrawSettings & PointerDrawSettings & BackgroundDrawSettings;

export type BoidsDrawSettings = Readonly<{
  boidsAppearance: BoidsAppearanceDrawSetting,
  drawBoidVelocity: boolean,
  drawBoidAcceleration: boolean,
  drawBoidFieldOfView: boolean,
  drawBoidSearch: boolean,
}>;

export type BoidsAppearanceDrawSetting = Readonly<{
  type: BoidsAppearanceType.Triangle,
  color: Readonly<{ type: AppearanceColorType.Custom, value: string, } | { type: AppearanceColorType.Rainbow, }>,
} | {
  type: BoidsAppearanceType.Image,
  image: CanvasImageSource,
}>;

export enum BoidsAppearanceType { Triangle, Image }
export enum AppearanceColorType { Custom, Rainbow }

export type BordersDrawSettings = Readonly<{
  drawUnaffectedBorderedSpace: boolean,
}>;

export type PointerDrawSettings = Readonly<{
  pointerColor: Color,
  pointerRadius: number,
}>;

export type BackgroundDrawSettings = Readonly<{
  backgroundColor: Color,
  backgroundOpacity: number,
}>;

export type DrawSettingsChange = Partial<DrawSettings>;
// #endregion
