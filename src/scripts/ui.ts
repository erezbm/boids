import { MDCTopAppBar } from '@material/top-app-bar';
import { MDCRipple } from '@material/ripple';
import { MDCDrawer } from '@material/drawer';
import { MDCSlider } from '@material/slider';
import { MDCTextField } from '@material/textfield';

MDCTopAppBar.attachTo(document.querySelector('.mdc-top-app-bar')!);
const settingsButton = document.getElementById('boids-settings-btn') as HTMLButtonElement;
MDCRipple.attachTo(settingsButton);
const settingsDrawer = MDCDrawer.attachTo(document.getElementById('boids-settings-drawer')!);
settingsDrawer.list?.listElements.forEach((listElement) => MDCRipple.attachTo(listElement));
const numberOfBoidsTextField = new MDCTextField(document.getElementById('number-of-boids-text-field')!);

const numberOfBoidsSlider = new MDCSlider(document.getElementById('number-of-boids-slider')!);

numberOfBoidsSlider.listen('MDCSlider:input', () => {
  numberOfBoidsTextField.value = numberOfBoidsSlider.getValue().toString();
});

numberOfBoidsTextField.listen('input', () => {
  if (numberOfBoidsTextField.valid) {
    numberOfBoidsSlider.setValue(Number(numberOfBoidsTextField.value));
  }
});

settingsButton.addEventListener('click', () => {
  settingsDrawer.open = !settingsDrawer.open;
});
document.body.addEventListener('MDCDrawer:opened', () => {
  numberOfBoidsSlider.layout();
});

const canvas = document.getElementById('boids-canvas') as HTMLCanvasElement;
new ResizeObserver(() => {
  const { clientWidth, clientHeight } = document.documentElement;
  [canvas.width, canvas.height] = [clientWidth, clientHeight];
}).observe(document.documentElement);
