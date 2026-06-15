import InteriorObject from './InteriorObject.js';
import { solidRect } from '../prefab/solidRect.js';

// A table is solid over its WHOLE footprint, not just its base: you can't walk
// through the top half either (unlike tall props you can stand behind).
export default class Table extends InteriorObject {
  addCollider() {
    solidRect(
      this.scene, this.scene.solids,
      this.x + this.w / 2, this.y + this.h / 2, this.w, this.h
    );
  }

  // Examine prompt should trigger from ANY side, so anchor the interaction at the
  // table's centre with a range reaching one tile past its footprint all around.
  interactable(lines) {
    const it = super.interactable(lines);
    if (!it) return null;
    it.y = this.y + this.h / 2;
    it.range = Math.max(this.w, this.h) / 2 + 24;
    return it;
  }
}
