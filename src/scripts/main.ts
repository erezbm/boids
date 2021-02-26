import Simulator, { SimulatorSettings } from './simulator';
import { AppearanceColorType, AppearanceType } from './boid';
import { toRadians } from './utils';
import { ISidebarView, SidebarView } from './views/sidebar';

// TODO make boids flee from mouse
// TODO add sidebar with:
// - restart button
// - reset to defaults button (possibly reset to default button on each input)
// - inputs/checkboxes for the remaining settings
// TODO getting initial settings from url parameters, and add copy url with settings button
// TODO persist settings with cookies

const canvas = document.getElementById('boids-canvas') as HTMLCanvasElement;
new ResizeObserver(() => {
  const { clientWidth, clientHeight } = document.documentElement;
  [canvas.width, canvas.height] = [clientWidth, clientHeight];
}).observe(document.documentElement);

const visibleSpace = document.getElementById('visible-space')!;
const settings = getSimulatorSettings();
const simulator = new Simulator(canvas, visibleSpace, settings);
simulator.start();

const sidebarView: ISidebarView = new SidebarView(settings);
sidebarView.onSettingsChanged((changes) => {
  let actualChanges = changes;
  if (changes.boid?.radius !== undefined) {
    actualChanges = {
      ...actualChanges,
      boid: {
        ...actualChanges.boid,
        desiredSeparationDistance: 2 * changes.boid.radius,
      },
    };
  }
  if (changes.boid?.maxSpeed !== undefined) {
    actualChanges = {
      ...actualChanges,
      boid: {
        ...actualChanges.boid,
        maxForce: 1 * changes.boid.maxSpeed,
        desiredFlockSpeed: changes.boid.maxSpeed / 2,
      },
    };
  }
  simulator.changeSettings(actualChanges);
});

function getSimulatorSettings(): SimulatorSettings {
  const boidMaxSpeed = 500;
  const boidRadius = 20;
  return {
    numberOfBoids: 200,
    backgroundOpacity: 0.1,
    backgroundColor: '#222',
    boid: {
      maxSpeed: boidMaxSpeed,
      maxForce: 1 * boidMaxSpeed,
      viewDistance: 100,
      angleOfView: toRadians(360),
      radius: boidRadius,
      separationFactor: 2,
      alignmentFactor: 2,
      cohesionFactor: 1,
      desiredFlockSpeed: boidMaxSpeed / 2,
      desiredSeparationDistance: boidRadius * 2,
      searchTargetReachRadius: 15,
      maxSearchTime: 10,
      appearance: { type: AppearanceType.Triangle, color: { type: AppearanceColorType.Rainbow } },
      drawVelocity: false,
      drawAcceleration: false,
      drawFieldOfView: false,
      drawSearch: false,
    },
    borders: {
      effectDistance: 50,
      drawEffectDistance: false,
    },
  };
}
