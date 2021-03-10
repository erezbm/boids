import Vector from '../vector';
import { IReadonlyPointer } from './simulation';

export default class Pointer implements IReadonlyPointer {
  position: Vector | null = null;
  isDown = false;
}
