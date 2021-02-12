import { MDCTopAppBar } from '@material/top-app-bar';
import { MDCRipple } from '@material/ripple';
import { MDCDrawer } from '@material/drawer';
import { MDCSlider } from '@material/slider';
import { MDCTextField } from '@material/textfield';

import RectBorders from './borders';
import flags from './flags';
import Flock from './flock';
import zaguriImage from '/images/zaguri.png';

flags.image.src = zaguriImage;

const borders = new RectBorders(document.getElementById('visible-space')!);
const flock = new Flock(100, borders);

// TODO spawn boids on mouse drag
// TODO make boids flee from mouse
// TODO add sidebar with:
// - input for number of boids
// - input for background transparency
// - inputs for the various parameters
// - checkboxes for the different debug draw functions

const canvas = document.getElementById('boids-canvas') as HTMLCanvasElement;
const context = canvas.getContext('2d')!;
const updateAndDraw = (dt: number) => {
  flock.update(dt, borders);

  drawBackground(context);
  if (flags.debug) {
    borders.draw(context);
  }
  flock.draw(context);
};

const drawBackground = (ctx: CanvasRenderingContext2D) => {
  // ctx.fillStyle = '#2224';
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

let lastTime = performance.now();
requestAnimationFrame(function callback(time) {
  const dt = Math.min(time - lastTime, 1000 / 15) / 1000;
  updateAndDraw(dt);
  lastTime = time;
  requestAnimationFrame(callback);
});

// UI
MDCTopAppBar.attachTo(document.querySelector('.mdc-top-app-bar')!);
const settingsButton = document.getElementById('boids-settings-btn') as HTMLButtonElement;
MDCRipple.attachTo(settingsButton);
const settingsDrawer = MDCDrawer.attachTo(document.getElementById('boids-settings-drawer')!);
settingsDrawer.list?.listElements.forEach((listElement) => MDCRipple.attachTo(listElement));
const numberOfBoidsTextField = new MDCTextField(document.getElementById('number-of-boids-text-field')!);

const numberOfBoidsSlider = new MDCSlider(document.getElementById('number-of-boids-slider')!);

(() => {
  const n = flock.numBoids;
  numberOfBoidsTextField.value = n.toString();
  numberOfBoidsSlider.setValue(n);
})();

numberOfBoidsSlider.listen('MDCSlider:input', () => {
  const n = numberOfBoidsSlider.getValue();
  numberOfBoidsTextField.value = n.toString();
  flock.setNumBoids(n, borders);
});

numberOfBoidsTextField.listen('input', () => {
  if (numberOfBoidsTextField.valid) {
    const n = Number(numberOfBoidsTextField.value);
    numberOfBoidsSlider.setValue(n);
    flock.setNumBoids(n, borders);
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
