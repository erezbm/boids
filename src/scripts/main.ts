import CanvasAndDOMEventsSimulationView from './simulation/canvas-and-dom-events-simulation-view';
import Simulation, { AppearanceColorType, BoidsAppearanceType, SimulationSettings } from './simulation/simulation';
import { toRadians } from './utils';
import { ISidebarView, SidebarView } from './views/sidebar';

// TODO add sidebar with:
// - start/stop switch
// - reset to defaults button (possibly reset to default button on each input)
// - inputs/checkboxes for the remaining settings
// TODO getting initial settings from url parameters, and add copy url with settings button
// TODO persist settings with cookies

const canvas = document.getElementById('boids-canvas') as HTMLCanvasElement;
new ResizeObserver(() => {
  const { clientWidth, clientHeight } = document.documentElement;
  [canvas.width, canvas.height] = [clientWidth, clientHeight];
}).observe(document.documentElement);

const visibleSpaceEl = document.getElementById('visible-space')!;

const settings = getSimulationSettings(visibleSpaceEl.clientWidth * visibleSpaceEl.clientHeight);
const simulationView = new CanvasAndDOMEventsSimulationView(canvas, visibleSpaceEl);
const simulation = new Simulation(simulationView, settings);
simulation.start();

const sidebarView: ISidebarView = new SidebarView(settings);
sidebarView.on('settingsChanged', (changes) => {
  let actualChanges = changes;
  if (changes.worldSettingsChange?.boidsRadius !== undefined) {
    actualChanges = {
      ...actualChanges,
      worldSettingsChange: {
        ...actualChanges.worldSettingsChange,
        boidsDesiredSeparationDistance: 2 * changes.worldSettingsChange.boidsRadius,
      },
    };
  }
  if (changes.worldSettingsChange?.boidsMaxSpeed !== undefined) {
    const boidsMaxForce = 1 * changes.worldSettingsChange.boidsMaxSpeed;
    actualChanges = {
      ...actualChanges,
      worldSettingsChange: {
        ...actualChanges.worldSettingsChange,
        boidsMaxForce,
        boidsDesiredFlockSpeed: changes.worldSettingsChange.boidsMaxSpeed / 2,
        bordersMaxForce: 2 * boidsMaxForce,
      },
    };
  }
  if (changes.worldSettingsChange?.boidsMaxForce !== undefined) {
    actualChanges = {
      ...actualChanges,
      worldSettingsChange: {
        ...actualChanges.worldSettingsChange,
        bordersMaxForce: 2 * changes.worldSettingsChange.boidsMaxForce,
      },
    };
  }
  simulation.changeSettings(actualChanges);
});

function getSimulationSettings(visibleSpaceArea: number): SimulationSettings {
  const boidsMaxSpeed = 500;
  const boidsMaxForce = 1 * boidsMaxSpeed;
  const boidsRadius = 20;
  return {
    worldSettings: {
      numberOfBoids: Math.min(Math.round(visibleSpaceArea / 80 ** 2), 500),
      boidsMaxSpeed,
      boidsMaxForce,
      boidsViewDistance: 100,
      boidsAngleOfView: toRadians(360),
      boidsRadius,
      boidsSeparationFactor: 2,
      boidsAlignmentFactor: 2,
      boidsCohesionFactor: 1,
      boidsDesiredFlockSpeed: boidsMaxSpeed / 2,
      boidsDesiredSeparationDistance: boidsRadius * 2,
      boidsMouseAvoidanceForceFactor: 1_000_000,
      boidsSearchTargetReachRadius: 15,
      boidsMaxSearchTime: 10,
      bordersMaxForce: 2 * boidsMaxForce,
      bordersEffectDistance: 150,
    },
    drawSettings: {
      boidsAppearance: { type: BoidsAppearanceType.Triangle, color: { type: AppearanceColorType.Rainbow } },
      drawBoidVelocity: false,
      drawBoidAcceleration: false,
      drawBoidFieldOfView: false,
      drawBoidSearch: false,

      drawUnaffectedBorderedSpace: false,

      pointerColor: 'orange',
      pointerRadius: 10,

      backgroundOpacity: 0.1,
      backgroundColor: '#222222',
    },
  };
}
