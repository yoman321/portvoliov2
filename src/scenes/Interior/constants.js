import { TILE } from '../../config.js';

// Layout constants for the generic Interior scene. Walls are a solid border with
// a doorway gap at bottom-centre; [E] there returns to the exterior (or, for a
// room with a locked exit, plays its message).
export const WALL = 14; // wall thickness in px (sides + bottom)
export const BACK_WALL = TILE * 2; // top wall depth — deeper, for a back-wall space
export const DOOR_W = TILE * 1.5; // doorway gap width

// Solid props are only solid at their BASE (like the buildings outside): the
// bottom `PROP_FOOT` px block the player, while the taller upper part can be
// walked behind.
export const PROP_FOOT = TILE; // px of solid footprint at the prop's base

// 'indoor' spritesheet (Kenney Roguelike Indoor) is 27 tiles wide. Phaser numbers
// frames left→right, top→bottom, so a tile at (col, row) is `tileFrame(col, row)`.
export const INDOOR_COLS = 27;
export const tileFrame = (col, row) => row * INDOOR_COLS + col;