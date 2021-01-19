import Border from './border.js';
import flags from './flags.js';
import Flock from './flock.js';
import Vector from './vector.js';
const canvas = document.getElementById('boids-canvas');
const ctx = canvas.getContext('2d');
const updateCanvasSize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};
updateCanvasSize();
window.addEventListener('resize', updateCanvasSize);
const flock = new Flock(20, canvas.width, canvas.height);
const borders = [
    new Border(new Vector(1, 0), (p, r) => p.x - r),
    new Border(new Vector(0, 1), (p, r) => p.y - r),
    new Border(new Vector(-1, 0), (p, r) => canvas.width - (p.x + r)),
    new Border(new Vector(0, -1), (p, r) => canvas.height - (p.y + r)),
];
const updateAndDraw = (dt) => {
    const { width, height } = canvas;
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, width, height);
    if (flags.debug) {
        ctx.strokeStyle = 'yellow';
        ctx.strokeRect(Border.maxDistance, Border.maxDistance, width - 2 * Border.maxDistance, height - 2 * Border.maxDistance);
    }
    flock.update(dt, borders);
    flock.draw(ctx);
};
let lastTime = performance.now();
requestAnimationFrame(function callback(time) {
    const dt = Math.min(time - lastTime, 1000 / 15) / 1000;
    updateAndDraw(dt);
    lastTime = time;
    requestAnimationFrame(callback);
});
