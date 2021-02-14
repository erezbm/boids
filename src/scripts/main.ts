import { MDCTopAppBar } from '@material/top-app-bar';
import { MDCRipple } from '@material/ripple';
import { MDCDrawer } from '@material/drawer';
import { MDCSlider } from '@material/slider';
import { MDCTextField } from '@material/textfield';

import flags from './flags';
import zaguriImage from '/images/zaguri.png';
import Simulator from './simulator';

flags.image.src = zaguriImage;

// TODO spawn boids on mouse drag
// TODO make boids flee from mouse
// TODO add sidebar with:
// - restart button
// - reset to defaults button
// - input for number of boids
// - input for background transparency
// - inputs for the various parameters
// - checkboxes for the different debug draw functions
// TODO getting initial settings from url parameters
// TODO rainbow colored boids

const canvas = document.getElementById('boids-canvas') as HTMLCanvasElement;
const visibleSpace = document.getElementById('visible-space')!;
const simulator = new Simulator(canvas, visibleSpace);
simulator.numberOfBoids = 100;
simulator.start();

// UI
MDCTopAppBar.attachTo(document.querySelector('.mdc-top-app-bar')!);
const settingsButton = document.getElementById('boids-settings-btn') as HTMLButtonElement;
MDCRipple.attachTo(settingsButton);
const settingsDrawer = MDCDrawer.attachTo(document.getElementById('boids-settings-drawer')!);
const numberOfBoidsTextField = new MDCTextField(document.getElementById('number-of-boids-text-field')!);

const numberOfBoidsSlider = new MDCSlider(document.getElementById('number-of-boids-slider')!);

numberOfBoidsTextField.value = simulator.numberOfBoids.toString();
numberOfBoidsSlider.setValue(simulator.numberOfBoids);

numberOfBoidsSlider.listen('MDCSlider:input', () => {
  const n = numberOfBoidsSlider.getValue();
  numberOfBoidsTextField.value = n.toString();
  simulator.numberOfBoids = n;
});

numberOfBoidsTextField.listen('input', () => {
  if (numberOfBoidsTextField.valid) {
    const n = Number(numberOfBoidsTextField.value);
    numberOfBoidsSlider.setValue(n);
    simulator.numberOfBoids = n;
  }
});

settingsButton.addEventListener('click', () => {
  settingsDrawer.open = !settingsDrawer.open;
});
document.body.addEventListener('MDCDrawer:opened', () => {
  numberOfBoidsSlider.layout();
});

// const canvas = document.getElementById('boids-canvas') as HTMLCanvasElement;
new ResizeObserver(() => {
  const { clientWidth, clientHeight } = document.documentElement;
  [canvas.width, canvas.height] = [clientWidth, clientHeight];
}).observe(document.documentElement);
