// LPC ("Universal LPC Spritesheet") frame layout — 64px frames on a 13-col grid.
// Each animation sheet (walk.png, idle.png, …) is 832x256 = 13 cols x 4 rows,
// the 4 rows being the facing directions in this order:
export const DIRECTION_ROW = { up: 0, left: 1, down: 2, right: 3 };

const SHEET_COLS = 13; // 832 / 64
// Walk row: col 0 is the standing pose; cols 1-8 are the 8-frame step cycle.
const WALK_START = 1;
const WALK_END = 8;
const WALK_FRAME_RATE = 10;
// Idle sheet: cols 0-1 are a 2-frame breathing loop.
const IDLE_END = 1;
const IDLE_FRAME_RATE = 2;

// Registers `<key>-idle-<dir>` and `<key>-walk-<dir>` for all four directions.
// idle/walk frames can come from separate textures (idleKey/walkKey); a sprite
// playing these anims auto-swaps its texture per frame, so one sprite handles
// both sheets. Safe to call once per key.
export function registerCharAnims(scene, key, { idleKey = key, walkKey = key } = {}) {
  for (const [dir, row] of Object.entries(DIRECTION_ROW)) {
    const base = row * SHEET_COLS;

    if (!scene.anims.exists(`${key}-idle-${dir}`)) {
      scene.anims.create({
        key: `${key}-idle-${dir}`,
        frames: scene.anims.generateFrameNumbers(idleKey, { start: base, end: base + IDLE_END }),
        frameRate: IDLE_FRAME_RATE,
        repeat: -1,
      });
    }
    if (!scene.anims.exists(`${key}-walk-${dir}`)) {
      scene.anims.create({
        key: `${key}-walk-${dir}`,
        frames: scene.anims.generateFrameNumbers(walkKey, {
          start: base + WALK_START,
          end: base + WALK_END,
        }),
        frameRate: WALK_FRAME_RATE,
        repeat: -1,
      });
    }
  }
}
