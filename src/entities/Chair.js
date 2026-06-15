import InteriorObject from './InteriorObject.js';

// A chair: a small solid seat you bump into. Always solid (ignores `decor`) so
// the player collides with it; the 1-tile footprint blocks the whole chair.
export default class Chair extends InteriorObject {
  constructor(scene, def) {
    super(scene, { ...def, solid: true });
  }
}
