import { TILE, DEPTH } from '../config.js';

// Builds a tiled checkerboard floor: a TILE-sized texture (a `base` fill with two
// `alt` quadrants) generated once per `key`, then stretched across `w`×`h` as a
// tileSprite at ground depth. Shared by the exterior (grass) and every interior
// (per-room floor colours).
//
//   createFloor(scene, { key: 'grass', w, h, base: 0x3a7d3a, alt: 0x347034 })
//
// Returns the tileSprite so the caller can tweak it if needed.
export function createFloor(scene, { key, w, h, base, alt, depth = DEPTH.ground }) {
  if (!scene.textures.exists(key)) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(base, 1);
    g.fillRect(0, 0, TILE, TILE);
    g.fillStyle(alt, 1);
    g.fillRect(0, 0, TILE / 2, TILE / 2);
    g.fillRect(TILE / 2, TILE / 2, TILE / 2, TILE / 2);
    g.generateTexture(key, TILE, TILE);
    g.destroy();
  }
  return scene.add.tileSprite(0, 0, w, h, key).setOrigin(0, 0).setDepth(depth);
}
