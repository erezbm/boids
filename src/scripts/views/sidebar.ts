import { MDCDrawer } from '@material/drawer';
import { MDCRipple } from '@material/ripple';
import { MDCSelect } from '@material/select';
import { MDCSlider } from '@material/slider';
import { MDCTextField } from '@material/textfield';
import { MDCTopAppBar } from '@material/top-app-bar';
import { EventEmitter } from 'events';
import type StrictEventEmitter from 'strict-event-emitter-types';
import { AppearanceColorType, BoidsAppearanceType, SimulationSettings, SimulationSettingsChange } from '../simulation/simulation';
import { isWebpSupported } from '../utils';
import zaguriPngUrl from '/images/zaguri.png';
import zaguriWebpUrl from '/images/zaguri.webp';

type ISidebarViewEvents = {
  'settingsChanged': (changes: SimulationSettingsChange) => void,
};
type ISidebarViewEventEmitter = StrictEventEmitter<EventEmitter, ISidebarViewEvents>;
export interface ISidebarView extends ISidebarViewEventEmitter { }

const zaguriImage = new Image();
zaguriImage.src = isWebpSupported() ? zaguriWebpUrl : zaguriPngUrl;

export class SidebarView extends (EventEmitter as unknown as new () => ISidebarViewEventEmitter) implements ISidebarView {
  constructor({ worldSettings, drawSettings }: SimulationSettings) {
    super();

    MDCTopAppBar.attachTo(document.querySelector('.mdc-top-app-bar')!);
    const toggleSettingsButton = document.getElementById('toggle-settings-btn') as HTMLButtonElement;
    MDCRipple.attachTo(toggleSettingsButton);
    const closeSettingsButton = document.getElementById('close-settings-btn') as HTMLButtonElement;
    const closeSettingsButtonRipple = MDCRipple.attachTo(closeSettingsButton);
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

    numberOfBoidsTextField.value = worldSettings.numberOfBoids.toString();
    numberOfBoidsSlider.setValue(Math.sqrt(worldSettings.numberOfBoids));
    backgroundOpacitySlider.setValue(drawSettings.backgroundOpacity);
    backgroundColorTextField.value = drawSettings.backgroundColor;
    backgroundColorInput.value = drawSettings.backgroundColor;
    backgroundColorInputWrapper.style.backgroundColor = drawSettings.backgroundColor;
    boidRadiusSlider.setValue(worldSettings.boidsRadius);
    appearanceTypeSelect.selectedIndex = 1;
    boidMaxSpeedSlider.setValue(worldSettings.boidsMaxSpeed);

    numberOfBoidsTextField.listen('input', () => {
      if (numberOfBoidsTextField.valid) {
        const n = Number(numberOfBoidsTextField.value);
        numberOfBoidsSlider.setValue(Math.sqrt(n));
        this.emit('settingsChanged', { worldSettingsChange: { numberOfBoids: n } });
      }
    });

    numberOfBoidsSlider.listen('MDCSlider:input', () => {
      const n = Math.round(numberOfBoidsSlider.getValue() ** 2);
      numberOfBoidsTextField.value = n.toString();
      this.emit('settingsChanged', { worldSettingsChange: { numberOfBoids: n } });
    });

    backgroundOpacitySlider.listen('MDCSlider:input', () => {
      this.emit('settingsChanged', { drawSettingsChange: { backgroundOpacity: backgroundOpacitySlider.getValue() } });
    });

    backgroundColorTextField.listen('input', () => {
      const backgroundColor = backgroundColorTextField.value;
      backgroundColorInput.value = backgroundColor;
      backgroundColorInputWrapper.style.backgroundColor = backgroundColor;
      this.emit('settingsChanged', { drawSettingsChange: { backgroundColor } });
    });

    backgroundColorInput.addEventListener('input', () => {
      const backgroundColor = backgroundColorInput.value;
      backgroundColorTextField.value = backgroundColor;
      backgroundColorInputWrapper.style.backgroundColor = backgroundColor;
      this.emit('settingsChanged', { drawSettingsChange: { backgroundColor } });
    });

    boidRadiusSlider.listen('MDCSlider:input', () => {
      this.emit('settingsChanged', { worldSettingsChange: { boidsRadius: boidRadiusSlider.getValue() } });
    });

    appearanceTypeSelect.listen('MDCSelect:change', () => {
      const appearanceType = appearanceTypeSelect.value;
      if (appearanceType === 'image') {
        this.emit('settingsChanged', {
          drawSettingsChange: { boidsAppearance: { type: BoidsAppearanceType.Image, image: zaguriImage } },
        });
      } else if (appearanceType === 'triangle') {
        this.emit('settingsChanged', {
          drawSettingsChange: { boidsAppearance: { type: BoidsAppearanceType.Triangle, color: { type: AppearanceColorType.Custom, value: '#0f0' } } },
        });
      } else if (appearanceType === 'rainbow') {
        this.emit('settingsChanged', {
          drawSettingsChange: { boidsAppearance: { type: BoidsAppearanceType.Triangle, color: { type: AppearanceColorType.Rainbow } } },
        });
      }
    });

    boidMaxSpeedSlider.listen('MDCSlider:input', () => {
      this.emit('settingsChanged', { worldSettingsChange: { boidsMaxSpeed: boidMaxSpeedSlider.getValue() } });
    });

    toggleSettingsButton.addEventListener('click', () => {
      settingsDrawer.open = !settingsDrawer.open;
    });

    closeSettingsButton.addEventListener('click', () => {
      settingsDrawer.open = false;
    });

    document.body.addEventListener('MDCDrawer:opened', () => {
      closeSettingsButtonRipple.layout();
      numberOfBoidsSlider.layout();
      backgroundOpacitySlider.layout();
      boidRadiusSlider.layout();
      boidMaxSpeedSlider.layout();
    });

    document.body.addEventListener('MDCDrawer:opened', () => {
      toggleSettingsButton.blur();
    });
    document.body.addEventListener('MDCDrawer:closed', () => {
      toggleSettingsButton.blur();
    });
  }
}
