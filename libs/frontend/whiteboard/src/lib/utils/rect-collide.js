import { quadtree as d3Quadtree } from 'd3-quadtree';

export function rectCollide() {
  const padding = 20;
  let nodes;

  function force() {
    const quadTree = d3Quadtree(
      nodes,
      (d) => d.x,
      (d) => d.y
    );
    for (const node of nodes) {
      quadTree.visit((q) => {
        let updated = false;
        if (q.data && q.data !== node) {
          let x = node.x - q.data.x,
            y = node.y - q.data.y,
            xSpacing = padding + (q.data.width + node.width) / 2,
            ySpacing = padding + (q.data.height + node.height) / 2,
            absX = Math.abs(x),
            absY = Math.abs(y),
            l,
            lx,
            ly;

          if (absX < xSpacing && absY < ySpacing) {
            l = Math.sqrt(x * x + y * y);

            lx = (absX - xSpacing) / l;
            ly = (absY - ySpacing) / l;

            if (Math.abs(lx) > Math.abs(ly)) {
              lx = 0;
            } else {
              ly = 0;
            }
            node.x -= x *= lx / 2;
            node.y -= y *= ly / 2;
            q.data.x += x / 2;
            q.data.x += x / 2;

            updated = true;
          }
        }
        return updated;
      });
    }
  }

  force.initialize = (_) => (nodes = _);

  return force;
}
