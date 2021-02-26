import { MDCDrawer } from '@material/drawer';
import { MDCRipple } from '@material/ripple';
import { MDCSelect } from '@material/select';
import { MDCSlider } from '@material/slider';
import { MDCTextField } from '@material/textfield';
import { MDCTopAppBar } from '@material/top-app-bar';
import { AppearanceColorType, AppearanceType } from '../boid';
import { SimulatorSettings, SimulatorSettingsChanges } from '../simulator';
import zaguriImageUrl from '/images/zaguri.png';

export type SettingsChangedHandler = (changes: SimulatorSettingsChanges) => void;
export interface ISidebarView {
  onSettingsChanged(handler: SettingsChangedHandler): void;
}

const zaguriImage = new Image();
zaguriImage.src = zaguriImageUrl;

export class SidebarView implements ISidebarView {
  #handler: SettingsChangedHandler = () => { };

  constructor(settings: SimulatorSettings) {
    MDCTopAppBar.attachTo(document.querySelector('.mdc-top-app-bar')!);
    const settingsButton = document.getElementById('boids-settings-btn') as HTMLButtonElement;
    MDCRipple.attachTo(settingsButton);
    const settingsDrawer = MDCDrawer.attachTo(document.getElementById('boids-settings-drawer')!);
    const numberOfBoidsTextField = MDCTextField.attachTo(document.getElementById('number-of-boids-text-field')!);
    const numberOfBoidsSlider = MDCSlider.attachTo(document.getElementById('number-of-boids-slider')!);
    const backgroundOpacitySlider = MDCSlider.attachTo(document.getElementById('background-opacity-slider')!);
    const boidRadiusSlider = MDCSlider.attachTo(document.getElementById('boid-radius-slider')!);
    const appearanceTypeSelect = MDCSelect.attachTo(document.getElementById('appearance-type-select')!);
    const boidMaxSpeedSlider = MDCSlider.attachTo(document.getElementById('boid-max-speed-slider')!);

    numberOfBoidsTextField.value = settings.numberOfBoids.toString();
    numberOfBoidsSlider.setValue(settings.numberOfBoids);

    backgroundOpacitySlider.setValue(settings.backgroundOpacity);

    boidRadiusSlider.setValue(settings.boid.radius);

    boidMaxSpeedSlider.setValue(settings.boid.maxSpeed);

    numberOfBoidsTextField.listen('input', () => {
      if (numberOfBoidsTextField.valid) {
        const n = Number(numberOfBoidsTextField.value);
        numberOfBoidsSlider.setValue(n);
        this.#handler({ numberOfBoids: n });
      }
    });

    numberOfBoidsSlider.listen('MDCSlider:input', () => {
      const n = numberOfBoidsSlider.getValue();
      numberOfBoidsTextField.value = n.toString();
      this.#handler({ numberOfBoids: n });
    });

    backgroundOpacitySlider.listen('MDCSlider:input', () => {
      this.#handler({ backgroundOpacity: backgroundOpacitySlider.getValue() });
    });

    boidRadiusSlider.listen('MDCSlider:input', () => {
      this.#handler({ boid: { radius: boidRadiusSlider.getValue() } });
    });

    boidMaxSpeedSlider.listen('MDCSlider:input', () => {
      this.#handler({ boid: { maxSpeed: boidMaxSpeedSlider.getValue() } });
    });

    appearanceTypeSelect.listen('MDCSelect:change', () => {
      const appearanceType = appearanceTypeSelect.value;
      if (appearanceType === 'image') {
        this.#handler({ boid: { appearance: { type: AppearanceType.Image, image: zaguriImage } } });
      } else if (appearanceType === 'triangle') {
        this.#handler({ boid: { appearance: { type: AppearanceType.Triangle, color: { type: AppearanceColorType.Custom, value: '#0f0' } } } });
      } else if (appearanceType === 'rainbow') {
        this.#handler({ boid: { appearance: { type: AppearanceType.Triangle, color: { type: AppearanceColorType.Rainbow } } } });
      }
    });

    settingsButton.addEventListener('click', () => {
      settingsDrawer.open = !settingsDrawer.open;
    });
    document.body.addEventListener('MDCDrawer:opened', () => {
      numberOfBoidsSlider.layout();
      backgroundOpacitySlider.layout();
      boidRadiusSlider.layout();
      boidMaxSpeedSlider.layout();
    });
  }

  onSettingsChanged(handler: SettingsChangedHandler) {
    this.#handler = handler;
  }
}
