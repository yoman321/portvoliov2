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
import { PROFILE, DUNGEON_BOSS } from './portfolio.js';

export const INTERIORS = {
  home: {
    name: 'Home',
    cols: 15,
    rows: 10,
    floor: 0x6b4f3a,
    floorAlt: 0x5e4633,
    wall: 0x3a2a1d,
    accent: 0x4a6fa5,
    resident: null,
    // The exit is sealed for now — interacting with the door plays this instead
    // of leaving. Remove this field to re-enable the portal out to the clearing.
    lockedExit: ['The door won’t budge.', 'It’s not your time to leave yet.'],
    props: [
      {
        tx: 1, ty: 1, tw: 2, th: 3, color: 0x6a4a7a, name: 'Bed',
        examine: ['Your bed. Adventuring is tiring work.'],
      },
      {
        tx: 10, ty: 1, tw: 4, th: 2, color: 0x4a6fa5, name: 'Notice Board',
        examine: [
          `${PROFILE.name} — ${PROFILE.tagline}`,
          `GitHub: ${PROFILE.links.github}`,
          `Email: ${PROFILE.links.email}`,
          'Three shops out in the clearing. Each smith of a different craft.',
        ],
      },
      {
        tx: 11, ty: 6, tw: 2, th: 2, color: 0xb08040, name: 'Chest',
        examine: ['Old projects, half-finished ideas, the occasional gem.'],
      },
      {
        tx: 5, ty: 1, tw: 1, th: 2, color: 0x9fb4c4, name: 'Mirror',
        about: true, // [E] opens the About Me modal (your reflection)
      },
      { tx: 6, ty: 5, tw: 3, th: 2, color: 0x7a3a3a, decor: true }, // rug
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
