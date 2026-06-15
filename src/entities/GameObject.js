import { DEPTH } from '../config.js';
import { solidRect } from '../prefab/solidRect.js';

// Top-level base for any positioned thing drawn into a scene. Owns the three
// universals: size (x, y, w, h in pixels), how it's displayed, and its collider.
//
// Display (in priority order):
//   - tiles: frames from spritesheet `texture`, stacked top→bottom (one per row)
//   - texture: a single image/png (key already loaded), optional `frame`
//   - color: a flat rounded rectangle (fallback)
//
// opts: { x, y, w, h, color?, texture?, frame?, tiles?, tileSize?,
//         solid=true, depthOffset=0 }
export default class GameObject {
  constructor(scene, opts) {
    this.scene = scene;
    this.x = opts.x;
    this.y = opts.y;
    this.w = opts.w;
    this.h = opts.h;
    this.bottom = this.y + this.h;

    this.color = opts.color;
    this.texture = opts.texture;
    this.frame = opts.frame;
    this.tiles = opts.tiles;
    this.tileSize = opts.tileSize ?? this.h;
    this.solid = opts.solid ?? true;
    this.depthOffset = opts.depthOffset ?? 0;

    this.draw();
    if (this.solid) this.addCollider();
  }

  // Feet-anchored y depth-sort so the player can pass behind/in front by world-y.
  get depth() {
    return DEPTH.entities + this.bottom * 0.001 + this.depthOffset;
  }

  draw() {
    const { scene, x, y, w, h } = this;
    if (this.tiles) {
      this.tiles.forEach((frame, i) => {
        scene.add.image(x, y + i * this.tileSize, this.texture, frame)
          .setOrigin(0, 0).setDisplaySize(w, this.tileSize).setDepth(this.depth);
      });
    } else if (this.texture) {
      scene.add.image(x, y, this.texture, this.frame)
        .setOrigin(0, 0).setDisplaySize(w, h).setDepth(this.depth);
    } else {
      scene.add.graphics()
        .setDepth(this.depth)
        .fillStyle(this.color, 1)
        .fillRoundedRect(x, y, w, h, 3);
    }
  }

  // Whole-footprint collider; subclasses may override (e.g. base-only).
  addCollider() {
    solidRect(this.scene, this.scene.solids, this.x + this.w / 2, this.y + this.h / 2, this.w, this.h);
  }
}
