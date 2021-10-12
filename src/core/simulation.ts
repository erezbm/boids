import { CustomEventConstructor, TypedTypeCustomEvent } from '@/utils/custom-event-shim';
import EventTarget from 'event-target-shim';

export default class Simulation<TModelState> extends EventTarget<SimulationEventMap<TModelState>, 'strict'> {
  #modelState: TModelState;
  readonly #updateModel: UpdateModel<TModelState>;
  dtLimit: number;

  constructor(modelState: TModelState, updateModel: UpdateModel<TModelState>, dtLimit = 1 / 15) {
    super();
    this.#modelState = modelState;
    this.#updateModel = updateModel;
    this.dtLimit = dtLimit;
  }

  #requestId: number | null = null;
  start() {
    if (this.#requestId !== null) return;

    let lastUpdateTime = performance.now();
    const callback = () => {
      const time = performance.now();
      const dt = Math.min((time - lastUpdateTime) / 1000, this.dtLimit); // limit the time between updates if it is running slow

      this.#changeModelState(this.#updateModel(this.#modelState, dt));

      lastUpdateTime = time;
      this.#requestId = requestAnimationFrame(callback);
    };
    this.#requestId = requestAnimationFrame(callback);
  }

  stop() {
    if (this.#requestId === null) return;

    cancelAnimationFrame(this.#requestId);
    this.#requestId = null;
  }

  #changeModelState(newModelState: TModelState) {
    this.#modelState = newModelState;
    this.dispatchEvent(new CustomEvent('modelStateChanged', { detail: this.#modelState }));
  }
}

type SimulationEventMap<TModelState> = {
  modelStateChanged: TypedTypeCustomEvent<TModelState, 'modelStateChanged'>;
};

type UpdateModel<TModelState> = (modelState: TModelState, dt: number) => TModelState;

// Fix CustomEvent's type property (doesn't work when moved to another file)
// eslint-disable-next-line vars-on-top, no-var
declare var CustomEvent: CustomEventConstructor;
