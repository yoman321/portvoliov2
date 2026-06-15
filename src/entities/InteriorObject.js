import GameObject from './GameObject.js';
import { TILE } from '../config.js';
import { solidRect } from '../prefab/solidRect.js';
import { PROP_FOOT } from '../scenes/Interior/constants.js';

// A static thing placed in an interior room (furniture, decor, fixtures). Adds
// the interior-specific layer on top of GameObject: tile coordinates, a base-only
// collider (so tall props can be walked behind), and an [E] examine interactable.
//
// def: { tx, ty, tw, th, color?, texture?, frame?, tiles?, name?, examine?,
//        solid?, decor? }
//   - tiles: indoor-tileset frames stacked top→bottom (one per tile row)
//   - texture/frame: a png (preloaded key) to display instead of a colour block
//   - solid (default true unless decor): only the base footprint blocks the player
export default class InteriorObject extends GameObject {
  constructor(scene, def) {
    const solid = def.solid ?? !def.decor;
    super(scene, {
      x: def.tx * TILE,
      y: def.ty * TILE,
      w: def.tw * TILE,
      h: def.th * TILE,
      color: def.color,
      texture: def.tiles ? 'indoor' : def.texture,
      frame: def.frame,
      tiles: def.tiles,
      tileSize: TILE,
      solid,
      // Flat decor (rugs, banners) draws beneath everything else.
      depthOffset: solid ? 0 : -0.5,
    });
    this.def = def;
    this.name = def.name;
    // The object owns its examine dialogue. Defaults to the def's lines, but a
    // subclass can override `examine` to carry its own (see Bed).
    this.examine = def.examine;
  }

  // Only the base is solid (its footprint): tall props can be walked behind.
  addCollider() {
    const footTop = this.bottom - Math.min(this.h, PROP_FOOT);
    solidRect(
      this.scene, this.scene.solids,
      this.x + this.w / 2, (footTop + this.bottom) / 2, this.w, this.bottom - footTop
    );
  }

  // Descriptor for the scene's interactables, or null if not examinable.
  // `lines` lets the scene inject resolved text (e.g. wares).
  interactable(lines = this.examine) {
    if (!lines) return null;
    return {
      x: this.x + this.w / 2,
      y: this.bottom,
      promptY: this.y - 6,
      range: 34,
      label: '[E] look',
      action: (s) => s.openDialogue(this.name || 'Note', lines),
    };
  }
}
