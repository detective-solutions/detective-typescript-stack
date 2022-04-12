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
  locked!: boolean;

  constructor(id: string, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
  }

  // Important for force collision calculation
  get r() {
    return 200;
  }
}
