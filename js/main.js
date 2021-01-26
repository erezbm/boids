import RectBorders from './borders.js';
import flags from './flags.js';
import Flock from './flock.js';
import Rectangle from './rectangle.js';
const canvas = document.getElementById('boids-canvas');
[canvas.width, canvas.height] = [window.innerWidth, window.innerHeight];
window.addEventListener('resize', () => {
    [canvas.width, canvas.height] = [window.innerWidth, window.innerHeight];
    borders.setSize(canvas.width, canvas.height);
});
const spaceRect = new Rectangle(0, 0, canvas.width, canvas.height);
const borders = new RectBorders(spaceRect);
const flock = new Flock(100, borders);
// TODO spawn boids on mouse drag
// TODO make boids flee from mouse
// TODO add checkboxes for the different debug draw functions
const context = canvas.getContext('2d');
const updateAndDraw = (dt) => {
    flock.update(dt, borders);
    drawBackground(context);
    if (flags.debug) {
        borders.draw(context);
    }
    flock.draw(context);
};
const drawBackground = (ctx) => {
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
