import { MDCDrawer } from '@material/drawer';
import { MDCRipple } from '@material/ripple';
import { MDCSelect } from '@material/select';
import { MDCSlider } from '@material/slider';
import { MDCTextField } from '@material/textfield';
import { MDCTopAppBar } from '@material/top-app-bar';
import { AppearanceColorType, AppearanceType } from '../boid';
import { SimulatorSettings, SimulatorSettingsChanges } from '../simulator';
import { isWebpSupported } from '../utils';
import zaguriPngUrl from '/images/zaguri.png';
import zaguriWebpUrl from '/images/zaguri.webp';

export type SettingsChangedHandler = (changes: SimulatorSettingsChanges) => void;
export interface ISidebarView {
  onSettingsChanged(handler: SettingsChangedHandler): void;
}

const zaguriImage = new Image();
zaguriImage.src = isWebpSupported() ? zaguriWebpUrl : zaguriPngUrl;

export class SidebarView implements ISidebarView {
  #handler: SettingsChangedHandler = () => { };

  constructor(settings: SimulatorSettings) {
    MDCTopAppBar.attachTo(document.querySelector('.mdc-top-app-bar')!);
    const toggleSettingsButton = document.getElementById('toggle-settings-btn') as HTMLButtonElement;
    MDCRipple.attachTo(toggleSettingsButton);
    const closeSettingsButton = document.getElementById('close-settings-btn') as HTMLButtonElement;
    MDCRipple.attachTo(closeSettingsButton);
    const settingsDrawer = MDCDrawer.attachTo(document.getElementById('boids-settings-drawer')!);

    const numberOfBoidsTextField = MDCTextField.attachTo(document.getElementById('number-of-boids-text-field')!);
    const numberOfBoidsSlider = MDCSlider.attachTo(document.getElementById('number-of-boids-slider')!);
    const backgroundOpacitySlider = MDCSlider.attachTo(document.getElementById('background-opacity-slider')!);
    const backgroundColorTextField = MDCTextField.attachTo(document.getElementById('background-color-text-field')!);
    const backgroundColorInput = document.getElementById('background-color-input') as HTMLInputElement;
    const backgroundColorInputWrapper = document.getElementById('background-color-input-wrapper')!;
    const boidRadiusSlider = MDCSlider.attachTo(document.getElementById('boid-radius-slider')!);
    const appearanceTypeSelect = MDCSelect.attachTo(document.getElementById('appearance-type-select')!);
    const boidMaxSpeedSlider = MDCSlider.attachTo(document.getElementById('boid-max-speed-slider')!);

    numberOfBoidsTextField.value = settings.numberOfBoids.toString();
    numberOfBoidsSlider.setValue(Math.sqrt(settings.numberOfBoids));
    backgroundOpacitySlider.setValue(settings.backgroundOpacity);
    backgroundColorTextField.value = settings.backgroundColor;
    backgroundColorInput.value = settings.backgroundColor;
    backgroundColorInputWrapper.style.backgroundColor = settings.backgroundColor;
    boidRadiusSlider.setValue(settings.boid.radius);
    appearanceTypeSelect.selectedIndex = 1;
    boidMaxSpeedSlider.setValue(settings.boid.maxSpeed);

    numberOfBoidsTextField.listen('input', () => {
      if (numberOfBoidsTextField.valid) {
        const n = Number(numberOfBoidsTextField.value);
        numberOfBoidsSlider.setValue(Math.sqrt(n));
        this.#handler({ numberOfBoids: n });
      }
    });

    numberOfBoidsSlider.listen('MDCSlider:input', () => {
      const n = Math.round(numberOfBoidsSlider.getValue() ** 2);
      numberOfBoidsTextField.value = n.toString();
      this.#handler({ numberOfBoids: n });
    });

    backgroundOpacitySlider.listen('MDCSlider:input', () => {
      this.#handler({ backgroundOpacity: backgroundOpacitySlider.getValue() });
    });

    backgroundColorTextField.listen('input', () => {
      const backgroundColor = backgroundColorTextField.value;
      backgroundColorInput.value = backgroundColor;
      backgroundColorInputWrapper.style.backgroundColor = backgroundColor;
      this.#handler({ backgroundColor });
    });

    backgroundColorInput.addEventListener('input', () => {
      const backgroundColor = backgroundColorInput.value;
      backgroundColorTextField.value = backgroundColor;
      backgroundColorInputWrapper.style.backgroundColor = backgroundColor;
      this.#handler({ backgroundColor });
    });

    boidRadiusSlider.listen('MDCSlider:input', () => {
      this.#handler({ boid: { radius: boidRadiusSlider.getValue() } });
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

    boidMaxSpeedSlider.listen('MDCSlider:input', () => {
      this.#handler({ boid: { maxSpeed: boidMaxSpeedSlider.getValue() } });
    });

    toggleSettingsButton.addEventListener('click', () => {
      settingsDrawer.open = !settingsDrawer.open;
    });

    closeSettingsButton.addEventListener('click', () => {
      settingsDrawer.open = false;
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
