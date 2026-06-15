import { TILE, DEPTH } from '../config.js';

// Builds a tiled floor, stretched across `w`×`h` as a tileSprite at ground depth.
// Shared by the exterior (grass) and every interior. Two tile sources:
//
//   // procedural checkerboard (a `base` fill with two `alt` quadrants)
//   createFloor(scene, { key: 'grass', w, h, base: 0x3a7d3a, alt: 0x347034 })
//
//   // a single frame from a loaded spritesheet (e.g. the indoor tileset)
//   createFloor(scene, { key: 'floor_indoor', w, h, tile: { sheet: 'indoor', frame: 24 } })
//
// Either way the TILE-sized texture is generated once per `key`. We bake the
// spritesheet frame into its OWN texture rather than tiling it straight off the
// sheet, since a tileSprite repeats the whole source image and would otherwise
// bleed in neighbouring tiles. Returns the tileSprite so the caller can tweak it.
export function createFloor(scene, { key, w, h, base, alt, tile, depth = DEPTH.ground }) {
  if (!scene.textures.exists(key)) {
    if (tile) {
      const src = scene.textures.getFrame(tile.sheet, tile.frame);
      const canvas = scene.textures.createCanvas(key, TILE, TILE);
      const ctx = canvas.getContext();
      ctx.imageSmoothingEnabled = false; // keep it crisp when scaled up to TILE
      ctx.drawImage(
        src.source.image,
        src.cutX, src.cutY, src.cutWidth, src.cutHeight,
        0, 0, TILE, TILE
      );
      canvas.refresh();
    } else {
      const g = scene.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(base, 1);
      g.fillRect(0, 0, TILE, TILE);
      g.fillStyle(alt, 1);
      g.fillRect(0, 0, TILE / 2, TILE / 2);
      g.fillRect(TILE / 2, TILE / 2, TILE / 2, TILE / 2);
      g.generateTexture(key, TILE, TILE);
      g.destroy();
    }
  }
  return scene.add.tileSprite(0, 0, w, h, key).setOrigin(0, 0).setDepth(depth);
}
