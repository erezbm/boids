import { MDCTopAppBar } from '@material/top-app-bar';
import { MDCRipple } from '@material/ripple';
import { MDCDrawer } from '@material/drawer';
import { MDCSlider } from '@material/slider';
import { MDCTextField } from '@material/textfield';
import { MDCSelect } from '@material/select';

import zaguriImageUrl from '/images/zaguri.png';
import Simulator, { SimulatorSettings } from './simulator';
import { AppearanceColorType, AppearanceType } from './boid';
import { toRadians } from './utils';

const zaguriImage = new Image();
zaguriImage.src = zaguriImageUrl;

// TODO spawn boids on mouse drag
// TODO make boids flee from mouse
// TODO add sidebar with:
// - restart button
// - reset to defaults button (possibly reset to default button on each input)
// - inputs/checkboxes for the remaining settings
// TODO getting initial settings from url parameters, and add copy url with settings button
// TODO persist settings with cookies

const canvas = document.getElementById('boids-canvas') as HTMLCanvasElement;
const visibleSpace = document.getElementById('visible-space')!;
const settings = getSimulatorSettings();
const simulator = new Simulator(canvas, visibleSpace, settings);
simulator.start();

function getSimulatorSettings(): SimulatorSettings {
  const boidMaxSpeed = 500;
  const boidRadius = 20;
  return {
    numberOfBoids: 200,
    backgroundOpacity: 0.1,
    boid: {
      maxSpeed: boidMaxSpeed,
      maxForce: 1 * boidMaxSpeed,
      viewDistance: 100,
      angleOfView: toRadians(360),
      radius: boidRadius,
      separationFactor: 1,
      alignmentFactor: 1,
      cohesionFactor: 1.5,
      desiredFlockSpeed: boidMaxSpeed / 2,
      desiredSeparationDistance: boidRadius * 2,
      searchTargetReachRadius: 15,
      maxSearchTime: 10,
      appearance: { type: AppearanceType.Triangle, color: { type: AppearanceColorType.Rainbow } },
      drawVelocity: false,
      drawAcceleration: false,
      drawFieldOfView: false,
      drawSearch: false,
    },
    borders: {
      effectDistance: 50,
      drawEffectDistance: false,
    },
  };
}

// UI
MDCTopAppBar.attachTo(document.querySelector('.mdc-top-app-bar')!);
const settingsButton = document.getElementById('boids-settings-btn') as HTMLButtonElement;
MDCRipple.attachTo(settingsButton);
const settingsDrawer = MDCDrawer.attachTo(document.getElementById('boids-settings-drawer')!);
const numberOfBoidsTextField = MDCTextField.attachTo(document.getElementById('number-of-boids-text-field')!);
const numberOfBoidsSlider = MDCSlider.attachTo(document.getElementById('number-of-boids-slider')!);
const backgroundOpacitySlider = MDCSlider.attachTo(document.getElementById('background-opacity-slider')!);
const appearanceTypeSelect = MDCSelect.attachTo(document.getElementById('appearance-type-select')!);

numberOfBoidsTextField.value = getSimulatorSettings().numberOfBoids.toString();
numberOfBoidsSlider.setValue(getSimulatorSettings().numberOfBoids);

backgroundOpacitySlider.setValue(getSimulatorSettings().backgroundOpacity);

numberOfBoidsTextField.listen('input', () => {
  if (numberOfBoidsTextField.valid) {
    const n = Number(numberOfBoidsTextField.value);
    numberOfBoidsSlider.setValue(n);
    simulator.changeSettings({ numberOfBoids: n });
  }
});

numberOfBoidsSlider.listen('MDCSlider:input', () => {
  const n = numberOfBoidsSlider.getValue();
  numberOfBoidsTextField.value = n.toString();
  simulator.changeSettings({ numberOfBoids: n });
});

backgroundOpacitySlider.listen('MDCSlider:input', () => {
  simulator.changeSettings({ backgroundOpacity: backgroundOpacitySlider.getValue() });
});

appearanceTypeSelect.listen('MDCSelect:change', () => {
  const appearanceType = appearanceTypeSelect.value;
  if (appearanceType === 'image') {
    simulator.changeSettings({ boid: { appearance: { type: AppearanceType.Image, image: zaguriImage } } });
  } else if (appearanceType === 'triangle') {
    simulator.changeSettings({ boid: { appearance: { type: AppearanceType.Triangle, color: { type: AppearanceColorType.Custom, value: '#0f0' } } } });
  } else if (appearanceType === 'rainbow') {
    simulator.changeSettings({ boid: { appearance: { type: AppearanceType.Triangle, color: { type: AppearanceColorType.Rainbow } } } });
  }
});

settingsButton.addEventListener('click', () => {
  settingsDrawer.open = !settingsDrawer.open;
});
document.body.addEventListener('MDCDrawer:opened', () => {
  numberOfBoidsSlider.layout();
  backgroundOpacitySlider.layout();
});

// const canvas = document.getElementById('boids-canvas') as HTMLCanvasElement;
new ResizeObserver(() => {
  const { clientWidth, clientHeight } = document.documentElement;
  [canvas.width, canvas.height] = [clientWidth, clientHeight];
}).observe(document.documentElement);
