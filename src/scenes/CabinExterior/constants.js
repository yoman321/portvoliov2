import { TILE } from '../../config.js';
import { NPCS } from '../../data/portfolio.js';

// Layout constants for the CabinExterior town.
//
// A small 2D town in the Pokémon mould: a tree border rings the map, buildings
// are scattered across it, and a network of paths links their doors. Home sits
// top-left, the dungeon mouth bottom-right, and the shops fill the space between.
// Every building's door is on its BOTTOM edge, so you always approach from below.
export const COLS = 26;
export const ROWS = 18;
export const WORLD_W = COLS * TILE; // 832
export const WORLD_H = ROWS * TILE; // 576
export const BORDER = 2; // thickness (tiles) of the surrounding forest

// The collision body is inset from each building's TOP edge by this much, so the
// player can step up behind the rear wall: everything from the building's top
// edge down to the player's feet (~WALK_IN + 4 px) is then drawn behind the
// building, so roughly the bottom third of the 64px sprite disappears behind it
// (Pokémon "legs hidden, head over the roofline"). Front and sides stay solid.
export const BUILDING_TOP_WALK_IN = 28; // px → ~32px hidden (feet + lower legs behind the wall)

// The collision body also extends this far PAST the building's front (bottom)
// edge — out to the doormat — so the player's feet stop just in front of the
// wall instead of visually climbing onto it.
export const BUILDING_FRONT_PAD = 6; // px (matches the doormat depth)

// Buildings in tile coords: { col, row } = top-left corner, { w, h } in tiles.
// The door is a single tile centred on the bottom edge.
export const BUILDINGS = [
  { id: 'home', name: 'Home', sub: '', col: 3, row: 3, w: 5, h: 3, body: 0x5a3d28, roof: 0x4a6fa5 },
  { id: 'smithy', name: 'Smithy', sub: NPCS.blacksmith.role, col: 16, row: 3, w: 4, h: 3, body: 0x4a4a52, roof: 0x9c4a3a },
  { id: 'market', name: 'Market', sub: NPCS.merchant.role, col: 8, row: 9, w: 4, h: 3, body: 0x3d4a5a, roof: 0x3a7a9c },
  { id: 'apothecary', name: 'Apothecary', sub: NPCS.alchemist.role, col: 13, row: 9, w: 4, h: 3, body: 0x4a3d5a, roof: 0x6a4a9c },
];

// Path segments (tile coords), each 2 tiles wide. Together they form a loop that
// every door opens onto, ending at the dungeon mouth in the bottom-right.
export const PATHS = [
  { tx: 3, ty: 6, tw: 19, th: 2 }, // top road  (below Home + Smithy doors)
  { tx: 3, ty: 14, tw: 19, th: 2 }, // bottom road (Market + Apothecary doors, to dungeon)
  { tx: 5, ty: 6, tw: 2, th: 10 }, // left link  (Home down to bottom road)
  { tx: 18, ty: 6, tw: 2, th: 10 }, // right link (Smithy <-> dungeon)
  { tx: 9, ty: 12, tw: 2, th: 3 }, // Market door -> bottom road
  { tx: 14, ty: 12, tw: 2, th: 3 }, // Apothecary door -> bottom road
];

// Dungeon mouth, sitting on the bottom road in the bottom-right corner.
export const CAVE = { x: (COLS - 4) * TILE, y: (ROWS - 3.5) * TILE };
