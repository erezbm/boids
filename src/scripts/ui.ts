import { MDCTopAppBar } from '@material/top-app-bar';
import { MDCRipple } from '@material/ripple';
import { MDCDrawer } from '@material/drawer';

MDCTopAppBar.attachTo(document.querySelector('.mdc-top-app-bar')!);
const settingsButton = document.getElementById('boids-settings-btn') as HTMLButtonElement;
MDCRipple.attachTo(settingsButton);
const settingsDrawer = MDCDrawer.attachTo(document.getElementById('boids-settings-drawer')!);
settingsDrawer.list?.listElements.forEach((listElement) => MDCRipple.attachTo(listElement));

settingsButton.addEventListener('click', () => {
  settingsDrawer.open = !settingsDrawer.open;
});

const canvas = document.getElementById('boids-canvas') as HTMLCanvasElement;
new ResizeObserver(() => {
  const { clientWidth, clientHeight } = document.documentElement;
  [canvas.width, canvas.height] = [clientWidth, clientHeight];
}).observe(document.documentElement);
