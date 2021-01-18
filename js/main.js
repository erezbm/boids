import Flock from './flock.js';
const canvas = document.getElementById('boids-canvas');
const updateCanvasSize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};
updateCanvasSize();
window.addEventListener('resize', updateCanvasSize);
const context = canvas.getContext('2d');
const flock = new Flock(20, canvas.width, canvas.height);
let lastUpdate = performance.now();
const updateAndDraw = (time) => {
    const dt = Math.min(time - lastUpdate, 1000 / 15);
    flock.update(dt, canvas.width, canvas.height);
    lastUpdate = time;
    flock.draw(context);
};
requestAnimationFrame(function callback(time) {
    updateAndDraw(time);
    requestAnimationFrame(callback);
});
