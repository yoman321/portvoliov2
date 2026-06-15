import { TILE } from '../../config.js';

// Layout constants for the generic Interior scene. Walls are a solid border with
// a doorway gap at bottom-centre; [E] there returns to the exterior (or, for a
// room with a locked exit, plays its message).
export const WALL = 14; // wall thickness in px
export const DOOR_W = TILE * 1.5; // doorway gap width

// Solid props are only solid at their BASE (like the buildings outside): the
// bottom `PROP_FOOT` px block the player, while the taller upper part can be
// walked behind. PROP_FRONT_PAD nudges the collider a hair past the front edge
// so feet stop just below the prop instead of clipping onto it.
export const PROP_FOOT = TILE; // px of solid footprint at the prop's base
// Extends the collider past the front edge far enough to also swallow the ~4px
// the player's feet visually poke forward (Player body is lifted off the feet),
// so feet stop cleanly below a prop instead of clipping onto it.
export const PROP_FRONT_PAD = 9; // px the collider extends past the front edge
