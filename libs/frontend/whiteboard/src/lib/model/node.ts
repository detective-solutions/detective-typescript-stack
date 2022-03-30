import { SimulationNodeDatum } from 'd3-force';

export class Node implements SimulationNodeDatum {
  // optional - defining optional implementation properties - required for relevant typing assistance
  index?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;

  width = 1000;
  height = 500;

  id: string;

  constructor(id: string) {
    this.id = id;
  }

  // Important for force collision calculation
  get r() {
    return 200;
  }

  get color() {
    return '#fc1767';
  }
}
