import { TILE, DEPTH } from '../config.js';
import { solidRect } from './solidRect.js';

// Builds a solid rectangular wall ring around a `w`×`h` area, `thickness` px
// thick, with an optional centred doorway gap on the bottom edge. The prefab owns
// the segment geometry + colliders (added to `solids`); the look is delegated:
//   - pass `key` + `paint(g)` to tile a generated texture (e.g. a forest border), or
//   - pass `render({ x, y, w, h })` to draw each segment yourself (e.g. flat walls).
// A border is just a wall with `doorWidth: 0`. Returns the segment rects.
// Pass `topThickness` to make the top (back) wall deeper than the sides/bottom.
export function createWall(
  scene,
  { solids, w, h, thickness, topThickness = thickness, doorWidth = 0, key, paint, depth = DEPTH.decorBelow, render }
) {
  if (key && paint && !scene.textures.exists(key)) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    paint(g);
    g.generateTexture(key, TILE, TILE);
    g.destroy();
  }
  const draw =
    render || ((s) => scene.add.tileSprite(s.x, s.y, s.w, s.h, key).setOrigin(0, 0).setDepth(depth));

  const t = thickness;
  const tt = topThickness;
  const gapL = w / 2 - doorWidth / 2;
  const gapR = w / 2 + doorWidth / 2;

  const segments = [
    { x: 0, y: 0, w, h: tt }, // top (back wall)
    { x: 0, y: tt, w: t, h: h - tt - t }, // left
    { x: w - t, y: tt, w: t, h: h - tt - t }, // right
  ];
  if (doorWidth > 0) {
    segments.push({ x: 0, y: h - t, w: gapL, h: t }); // bottom, left of doorway
    segments.push({ x: gapR, y: h - t, w: w - gapR, h: t }); // bottom, right of doorway
  } else {
    segments.push({ x: 0, y: h - t, w, h: t }); // bottom
  }

  segments.forEach((s) => {
    draw(s);
    solidRect(scene, solids, s.x + s.w / 2, s.y + s.h / 2, s.w, s.h);
  });
  return segments;
}
