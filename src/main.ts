import Flock from './flock.js';

const canvas = document.getElementById('boids-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

const updateCanvasSize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};
updateCanvasSize();
window.addEventListener('resize', updateCanvasSize);

const flock = new Flock(20, canvas.width, canvas.height);

const updateAndDraw = (dt: number) => {
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  flock.update(dt, canvas.width, canvas.height);
  flock.draw(ctx);
};

let lastTime = performance.now();
requestAnimationFrame(function callback(time) {
  const dt = Math.min(time - lastTime, 1000 / 15) / 1000;
  updateAndDraw(dt);
  lastTime = time;
  requestAnimationFrame(callback);
});
