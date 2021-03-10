import { EventEmitter } from 'events';
import type StrictEventEmitter from 'strict-event-emitter-types';
import Color from '../color';
import Rectangle from '../rectangle';
import { toRadians } from '../utils';
import Vector from '../vector';
import { AppearanceColorType, BackgroundDrawSettings, BoidsAppearanceType, BoidsDrawSettings, BordersDrawSettings, DrawSettings, IReadonlyBoid, IReadonlyBorders, IReadonlyPointer, IReadonlyWorld, ISimulationView, ISimulationViewEvents, PointerDrawSettings } from './simulation';

type ISimulationViewEventEmitter = StrictEventEmitter<EventEmitter, ISimulationViewEvents>;

export default class CanvasAndDOMEventsSimulationView extends (EventEmitter as unknown as new () => ISimulationViewEventEmitter) implements ISimulationView {
  #context: CanvasRenderingContext2D;
  #visibleSpace!: Rectangle;

  constructor(canvas: HTMLCanvasElement, visibleSpaceEl: HTMLElement) {
    super();
    this.#context = canvas.getContext('2d')!;

    const updateVisibleSpace = () => {
      const { x, y, width, height } = visibleSpaceEl.getBoundingClientRect();
      this.#visibleSpace = new Rectangle(x, y, width, height);
      this.emit('visibleSpaceChanged', this.visibleSpace);
    };
    new ResizeObserver(updateVisibleSpace).observe(visibleSpaceEl);
    updateVisibleSpace();

    const enterAndMoveListener = ({ isPrimary, clientX, clientY, buttons }: PointerEvent) => {
      // eslint-disable-next-line no-bitwise
      if (isPrimary) this.emit('pointerChanged', { position: new Vector(clientX, clientY), isDown: (buttons & 1) !== 0 });
    };
    visibleSpaceEl.addEventListener('pointerenter', enterAndMoveListener);
    visibleSpaceEl.addEventListener('pointermove', enterAndMoveListener);
    visibleSpaceEl.addEventListener('pointerleave', ({ isPrimary }) => { if (isPrimary) this.emit('pointerChanged', { position: null }); });
    visibleSpaceEl.addEventListener('pointerdown', ({ isPrimary }) => { if (isPrimary) this.emit('pointerChanged', { isDown: true }); });
    visibleSpaceEl.addEventListener('pointerup', ({ isPrimary }) => { if (isPrimary) this.emit('pointerChanged', { isDown: false }); });
    visibleSpaceEl.addEventListener('pointercancel', ({ isPrimary }) => { if (isPrimary) this.emit('pointerChanged', { position: null }); });
  }

  get visibleSpace() { return this.#visibleSpace; }

  drawWorld(world: IReadonlyWorld, settings: DrawSettings) {
    this.drawBackground(settings);
    this.drawBorders(world.borders, settings);
    this.drawBoids(world.boids, settings);
    this.drawPointer(world.pointer, settings);
  }

  private drawBackground({ backgroundColor, backgroundOpacity }: BackgroundDrawSettings) {
    const prevAlpha = this.#context.globalAlpha;

    this.#context.globalAlpha = backgroundOpacity;
    this.#context.fillStyle = backgroundColor;
    const { width, height } = this.#context.canvas;
    this.#context.fillRect(0, 0, width, height);

    this.#context.globalAlpha = prevAlpha;
  }

  private drawBorders({ unaffectedBorderedSpace }: IReadonlyBorders, { drawUnaffectedBorderedSpace }: BordersDrawSettings) {
    if (!drawUnaffectedBorderedSpace) return;

    const { x, y, width, height } = unaffectedBorderedSpace;
    this.#context.strokeStyle = 'yellow';
    this.#context.lineWidth = 1;
    this.#context.strokeRect(x, y, width, height);
  }

  private drawBoids(boids: readonly IReadonlyBoid[], settings: BoidsDrawSettings) {
    boids.forEach((boid) => this.drawBoid(boid, settings));
  }

  private drawBoid(boid: IReadonlyBoid, settings: BoidsDrawSettings) {
    this.drawBoidBody(boid, settings);

    const { drawBoidVelocity, drawBoidAcceleration, drawBoidFieldOfView, drawBoidSearch } = settings;
    if (drawBoidVelocity) this.drawBoidVelocity(boid);
    if (drawBoidAcceleration) this.drawBoidAcceleration(boid);
    if (drawBoidFieldOfView) this.drawBoidFieldOfView(boid);
    if (drawBoidSearch) this.drawBoidSearch(boid);
  }

  private drawBoidBody(boid: IReadonlyBoid, { boidsAppearance }: BoidsDrawSettings) {
    if (boidsAppearance.type === BoidsAppearanceType.Triangle) {
      const appearanceColor = boidsAppearance.color;
      this.#context.strokeStyle = appearanceColor.type === AppearanceColorType.Custom ? appearanceColor.value : boid.rainbowAppearanceColor;
      this.#context.lineWidth = 1;

      this.#context.save();
      this.#context.translate(boid.position.x, boid.position.y);
      this.#context.rotate(boid.velocity.angle());
      this.#context.beginPath();
      this.#context.moveTo(boid.radius, 0);
      const angle = toRadians(150);
      this.#context.lineTo(Math.cos(angle) * boid.radius, -Math.sin(angle) * boid.radius);
      this.#context.lineTo(Math.cos(-angle) * boid.radius, -Math.sin(-angle) * boid.radius);
      this.#context.closePath();
      this.#context.restore();

      this.#context.stroke();
    } else {
      this.#context.drawImage(
        boidsAppearance.image,
        boid.position.x - boid.radius,
        boid.position.y - boid.radius,
        2 * boid.radius,
        2 * boid.radius,
      );
    }
  }

  private drawBoidVelocity(boid: IReadonlyBoid) {
    this.#context.strokeStyle = boid.slowing ? 'blue'
      : boid.velocity.magGTE(boid.maxSpeed - 1) ? 'red'
        : 'yellow';
    this.#context.lineWidth = 50;

    this.#context.save();
    this.#context.translate(boid.position.x, boid.position.y);
    this.#context.beginPath();
    this.#context.moveTo(0, 0);
    this.#context.lineTo(boid.velocity.x, boid.velocity.y);
    this.#context.restore();

    this.#context.stroke();
  }

  private drawBoidAcceleration(boid: IReadonlyBoid) {
    this.#context.strokeStyle = 'green';
    this.#context.lineWidth = 20;
    this.#context.save();
    this.#context.translate(boid.position.x + boid.velocity.x / 144, boid.position.y + boid.velocity.y / 144);
    this.#context.beginPath();
    this.#context.moveTo(0, 0);
    this.#context.lineTo(boid.acceleration.x, boid.acceleration.y);
    this.#context.restore();
    this.#context.stroke();
  }

  private drawBoidFieldOfView(boid: IReadonlyBoid) {
    this.#context.strokeStyle = 'yellow';
    this.#context.lineWidth = 1;

    this.#context.beginPath();
    this.#context.arc(boid.position.x, boid.position.y, boid.radius + boid.viewDistance, 0, 2 * Math.PI);

    this.#context.stroke();
  }

  private drawBoidSearch(boid: IReadonlyBoid) {
    if (boid.currentSearch === null) return;

    this.#context.strokeStyle = '#FA4';
    this.#context.fillStyle = '#FA4';
    this.#context.lineWidth = 1;

    this.#context.beginPath();
    this.#context.arc(boid.currentSearch.targetPosition.x, boid.currentSearch.targetPosition.y, 3, 0, 2 * Math.PI);
    this.#context.fill();

    this.#context.beginPath();
    this.#context.arc(boid.currentSearch.targetPosition.x, boid.currentSearch.targetPosition.y, boid.searchTargetReachRadius, 0, 2 * Math.PI);
    this.#context.stroke();

    this.#context.beginPath();
    this.#context.moveTo(boid.position.x, boid.position.y);
    this.#context.lineTo(boid.currentSearch.targetPosition.x, boid.currentSearch.targetPosition.y);
    this.#context.stroke();
  }

  private drawPointer({ position, isDown }: IReadonlyPointer, { pointerColor, pointerRadius }: PointerDrawSettings) {
    if (position === null || !isDown) return;

    this.#context.fillStyle = pointerColor;
    this.#context.beginPath();
    this.#context.arc(position.x, position.y, pointerRadius, 0, 2 * Math.PI);
    this.#context.fill();
  }

  fillBackground(backgroundColor: Color) {
    this.drawBackground({ backgroundColor, backgroundOpacity: 1 });
  }
}
