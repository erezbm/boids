import Vector from '@/utils/vector';

export default class Boid {
  position: Vector;
  velocity = new Vector();
  acceleration = new Vector();

  constructor(position: Vector) {
    this.position = position;
  }
}
