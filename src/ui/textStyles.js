// Shared Phaser TextStyle presets for in-world UI text (canvas-rendered, so these
// are JS config objects, not CSS). Spread + override for per-instance tweaks,
// e.g. `{ ...SIGN, color: '#b0a080' }`.
const FONT = 'monospace';
const GOLD = '#ffe066';

// Plain gold caption with no plate (room name, floating labels).
export const LABEL = { fontFamily: FONT, fontSize: '9px', color: GOLD };

// Placard: centred text on a translucent black plate (building / exit signs).
export const SIGN = {
  fontFamily: FONT,
  fontSize: '8px',
  color: GOLD,
  align: 'center',
  backgroundColor: '#000000aa',
  padding: { x: 3, y: 2 },
};

// SIGN in a warning red (the dungeon mouth).
export const SIGN_DANGER = { ...SIGN, color: '#ff9a9a' };
