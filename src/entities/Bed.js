import InteriorObject from './InteriorObject.js';
import { solidRect } from '../prefab/solidRect.js';

// A bed: a solid piece of furniture that owns its own examine dialogue (a def can
// still override it by supplying `examine`). Its own type for future extension
// (e.g. a "sleep" interaction).
export default class Bed extends InteriorObject {
  constructor(scene, def) {
    super(scene, def);
    this.examine = def.examine ?? ['Your bed. Adventuring is tiring work.'];
  }

  // Solid over its whole footprint (not just the base), so the sides — including
  // the left edge — block the player.
  addCollider() {
    solidRect(
      this.scene, this.scene.solids,
      this.x + this.w / 2, this.y + this.h / 2, this.w, this.h
    );
  }
}
