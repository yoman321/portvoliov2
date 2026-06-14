// Central tunables. Keeping these in one place so scene/entity code stays
// declarative and the "feel" of the game is editable from a single file.

export const TILE = 32; // world grid size in source pixels

// How many screen pixels each source pixel occupies. The game renders into a
// low-resolution buffer (window / PIXEL_SCALE) that is CSS-upscaled to fill the
// window, so the art stays chunky and crisp at a *constant* scale while a bigger
// window simply reveals MORE of the world (and a smaller one less). See main.js.
export const PIXEL_SCALE = 3;

// A floor on the logical buffer so tiny windows still show a usable view
// (the world/UI never assume more than this many source pixels are visible).
export const MIN_VIEW_WIDTH = 360;
export const MIN_VIEW_HEIGHT = 240;

export const PLAYER = {
  speed: 110, // px/sec
  width: 18, // physics body, narrower than the sprite for nicer wall sliding
  height: 14, // body sits at the feet for top-down depth sorting
};

export const COLORS = {
  bg: 0x0d0b14,
  grass: 0x2e5a3a,
  grassAlt: 0x356646,
  path: 0x6b5535,
  player: 0xe8d8c0,
  playerAccent: 0x4a6fa5,
};

export const DEPTH = {
  ground: 0,
  decorBelow: 5,
  entities: 10, // entities self-sort by y within this band (see setDepth(y))
  decorAbove: 10000,
  ui: 20000,
};
