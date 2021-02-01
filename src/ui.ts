mdc.topAppBar.MDCTopAppBar.attachTo(document.querySelector('.mdc-top-app-bar')!);
const settingsButton = document.getElementById('boids-settings-btn') as HTMLButtonElement;
mdc.ripple.MDCRipple.attachTo(settingsButton);
const settingsDrawer = mdc.drawer.MDCDrawer.attachTo(document.getElementById('boids-settings-drawer')!);

settingsButton.addEventListener('click', () => {
  settingsDrawer.open = !settingsDrawer.open;
});

const canvas = document.getElementById('boids-canvas') as HTMLCanvasElement;
const mainContentEl = document.getElementById('main-content')!;
new ResizeObserver(() => {
  [canvas.width, canvas.height] = [mainContentEl.clientWidth, mainContentEl.clientHeight];
}).observe(mainContentEl);
