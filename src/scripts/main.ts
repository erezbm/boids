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
