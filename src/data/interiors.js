// Room definitions for every enterable building. InteriorScene renders these
// data-first, so adding/editing a room never touches scene code.
//
// Coordinates are in TILES from the room's top-left (walls included). `resident`
// names an NPC from portfolio.js whose dialogue plays on [E] talk; a prop with
// `wares: true` auto-lists that NPC's projects when examined.
//
//   prop: { tx, ty, tw, th, color, name?, examine?, wares?, solid?, decor? }
//     - name + (examine | wares)  -> examinable via [E] look
//     - solid (default true)      -> blocks the player; set decor:true to walk over
import { DUNGEON_BOSS } from './portfolio.js';
import { tileFrame } from '../scenes/Interior/constants.js';

export const INTERIORS = {
  home: {
    name: 'Home',
    cols: 15,
    rows: 10,
    floor: 0x6b4f3a,
    floorAlt: 0x5e4633,
    wall: 0xd8c4a0,
    accent: 0x4a6fa5,
    resident: null,
    // The exit is sealed for now — interacting with the door plays this instead
    // of leaving. Remove this field to re-enable the portal out to the clearing.
    lockedExit: ['The door won’t budge.', 'It’s not your time to leave yet.'],
    props: [
      {
        tx: 11.5, ty: 2.3, tw: 2.5, th: 1.5, type: 'bed', name: 'Bed',
        texture: 'indoor', frame: tileFrame(14, 3),
      },
      {
        tx: 9, ty: 0, tw: 1, th: 2, name: 'Mirror',
        tiles: [tileFrame(22, 14), tileFrame(22, 15)], // top→bottom
        about: true, // [E] opens the About Me modal (your reflection)
      },
      // Wall decoration strip to the left of the mirror (row 17, cols 16→18).
      { tx: 4, ty: 0, tw: 1, th: 1, tiles: [tileFrame(16, 17)], decor: true },
      { tx: 5, ty: 0, tw: 1, th: 1, tiles: [tileFrame(17, 17)], decor: true },
      { tx: 6, ty: 0, tw: 1, th: 1, tiles: [tileFrame(18, 17)], decor: true },
      // Lower strip (row 16, cols 16→18) directly below.
      { tx: 4, ty: 1, tw: 1, th: 1, tiles: [tileFrame(16, 16)], decor: true },
      { tx: 5, ty: 1, tw: 1, th: 1, tiles: [tileFrame(17, 16)], decor: true },
      { tx: 6, ty: 1, tw: 1, th: 1, tiles: [tileFrame(18, 16)], decor: true },
      {
        tx: 3, ty: 6, tw: 2, th: 2, type: 'table', name: 'Kitchen Table',
        tiles: [tileFrame(6, 9), tileFrame(6, 11)], // top→bottom row
        examine: ['A sturdy kitchen table.'],
      },
      { tx: 1.5, ty: 6, tw: 1.5, th: 1.5, type: 'chair', texture: 'indoor', frame: tileFrame(2, 7) }, // left chair
      { tx: 5, ty: 6, tw: 1.5, th: 1.5, type: 'chair', texture: 'indoor', frame: tileFrame(3, 7) }, // right chair
    ],
  },

  smithy: {
    name: 'Smithy',
    cols: 15,
    rows: 10,
    floor: 0x4a4a52,
    floorAlt: 0x42424a,
    wall: 0x2b2b30,
    accent: 0x9c4a3a,
    resident: 'blacksmith',
    residentAt: { tx: 7, ty: 2 },
    props: [
      {
        tx: 1, ty: 1, tw: 2, th: 2, color: 0x6a2a1a, name: 'Forge',
        examine: ['The coals never fully cool. Heat for things that must hold weight.'],
      },
      {
        tx: 5, ty: 6, tw: 2, th: 1, color: 0x3a3a42, name: 'Anvil',
        examine: ['Dented from years of load-bearing work. Still rings true.'],
      },
      {
        tx: 11, ty: 1, tw: 3, th: 1, color: 0x5a4a3a, name: 'Weapon Rack',
        wares: true,
      },
    ],
  },

  apothecary: {
    name: 'Apothecary',
    cols: 15,
    rows: 10,
    floor: 0x3a3550,
    floorAlt: 0x342f48,
    wall: 0x241f33,
    accent: 0x6a4a9c,
    resident: 'alchemist',
    residentAt: { tx: 7, ty: 2 },
    props: [
      {
        tx: 1, ty: 6, tw: 2, th: 2, color: 0x2a3a3a, name: 'Cauldron',
        examine: ['Something green simmers. Best not to ask what.'],
      },
      {
        tx: 6, ty: 6, tw: 3, th: 1, color: 0x4a3d2a, name: 'Worktable',
        examine: ['Notes, vials, and a few experiments still running.'],
      },
      {
        tx: 11, ty: 1, tw: 3, th: 1, color: 0x4a3a5a, name: 'Shelf of Phials',
        wares: true,
      },
    ],
  },

  market: {
    name: 'Market',
    cols: 15,
    rows: 10,
    floor: 0x5a4a3a,
    floorAlt: 0x524232,
    wall: 0x352a1f,
    accent: 0x3a7a9c,
    resident: 'merchant',
    residentAt: { tx: 7, ty: 2 },
    props: [
      {
        tx: 4, ty: 6, tw: 7, th: 1, color: 0x6a4a2a, name: 'Counter',
        examine: ['Polished smooth by a thousand handshakes and deals.'],
      },
      {
        tx: 1, ty: 1, tw: 2, th: 2, color: 0x7a5a32, name: 'Crates',
        wares: true,
      },
      { tx: 11, ty: 1, tw: 3, th: 1, color: 0x3a7a9c, decor: true }, // banner
    ],
  },

  // Reached from the street's right end. The "boss" is the capstone project.
  dungeon: {
    name: 'Dungeon',
    cols: 16,
    rows: 11,
    floor: 0x2a2730,
    floorAlt: 0x242029,
    wall: 0x16141c,
    accent: 0x7a2d3a,
    resident: null,
    props: [
      {
        tx: 6, ty: 3, tw: 4, th: 4, color: 0x6a1f2a, name: DUNGEON_BOSS.name,
        examine: [DUNGEON_BOSS.name, DUNGEON_BOSS.blurb],
      },
      { tx: 2, ty: 2, tw: 1, th: 3, color: 0x3a3540 }, // pillar
      { tx: 13, ty: 2, tw: 1, th: 3, color: 0x3a3540 }, // pillar
    ],
  },
};
