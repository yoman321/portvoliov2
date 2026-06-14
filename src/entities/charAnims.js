// Mana Seed "char_a_p1" frame layout (512x512 sheet, 64px frames, 8x8 grid).
//
// Rows 1-4 (index 0-3): stand / push / pull / jump  — col 0 is the idle pose.
// Rows 5-8 (index 4-7): walk (cols 0-5) + run frames (cols 6-7).
// Each block's 4 rows are the 4 facing directions, in this order:
export const DIRECTION_ROW = { down: 0, up: 1, right: 2, left: 3 };

const COLS = 8;
const WALK_FRAMES = 6; // cols 0-5
const WALK_FRAME_RATE = 8; // ~125ms/frame; guide suggests ~135ms

// Registers `<key>-idle-<dir>` and `<key>-walk-<dir>` for all four directions
// against a texture loaded with frameWidth/Height 64. Safe to call once per
// texture; layered paper-doll parts (base/outfit/hair) each get their own set
// and stay frame-synced because the indices + frame rate are identical.
export function registerCharAnims(scene, key) {
  for (const [dir, row] of Object.entries(DIRECTION_ROW)) {
    const idleFrame = row * COLS; // col 0 of the stand block
    const walkStart = (row + 4) * COLS; // walk block is rows 4-7

    if (!scene.anims.exists(`${key}-idle-${dir}`)) {
      scene.anims.create({
        key: `${key}-idle-${dir}`,
        frames: [{ key, frame: idleFrame }],
        frameRate: 1,
        repeat: -1,
      });
    }
    if (!scene.anims.exists(`${key}-walk-${dir}`)) {
      scene.anims.create({
        key: `${key}-walk-${dir}`,
        frames: scene.anims.generateFrameNumbers(key, {
          start: walkStart,
          end: walkStart + WALK_FRAMES - 1,
        }),
        frameRate: WALK_FRAME_RATE,
        repeat: -1,
      });
    }
  }
}
