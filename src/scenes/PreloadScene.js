import Phaser from 'phaser';
import { COLORS } from '../config.js';
import { registerCharAnims } from '../entities/charAnims.js';

// LPC animation sheets are 832x256 with 64px frames (13 cols x 4 rows).
const LPC_FRAME = { frameWidth: 64, frameHeight: 64 };

// Player is a single composited LPC character (one sheet per animation), not a
// paper-doll. Drop in more sheets from public/assets/player/ (run, jump, …) and
// register their anims to use them.
const PLAYER_SHEETS = {
  player_walk: 'assets/player/walk.png',
  player_idle: 'assets/player/idle.png',
};

// Kenney "Roguelike/RPG Indoor" tileset: 16px tiles with 1px spacing between
// them (458x305 → 27 columns x 18 rows). Loaded as a spritesheet so any tile is
// addressable by frame index. Frame numbering is left→right, top→bottom:
//   frame = row * INDOOR_COLS + col      (see INDOOR_COLS in Interior/constants)
const INDOOR_FRAME = { frameWidth: 16, frameHeight: 16, spacing: 1 };

// Loads art, then starts the first gameplay scene.
//
// The player uses real LPC sheets from public/assets/player/. NPCs are still
// GENERATED programmer-art placeholders until themed dolls land.
// Player.js reads animation keys by convention (`<key>-walk-<dir>` / `<key>-idle-<dir>`).
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    this.drawLoadingBar();
    for (const [key, path] of Object.entries(PLAYER_SHEETS)) {
      this.load.spritesheet(key, path, LPC_FRAME);
    }
    this.load.spritesheet('indoor', 'assets/interior/roguelikeIndoor_transparent.png', INDOOR_FRAME);
  }

  create() {
    // Player anims pull idle frames from idle.png and walk frames from walk.png;
    // the sprite swaps texture per frame as each anim plays.
    registerCharAnims(this, 'player', { idleKey: 'player_idle', walkKey: 'player_walk' });

    // NPCs still use generated placeholders until themed Mana Seed dolls land.
    this.makePlaceholderCharacter('npc_blacksmith', 0x9c4a3a, 0x2b2b2b);
    this.makePlaceholderCharacter('npc_alchemist', 0x6a4a9c, 0xc8e070);
    this.makePlaceholderCharacter('npc_merchant', 0x3a7a9c, 0xe0c060);

    this.scene.start('Interior', { id: 'home' });
  }

  drawLoadingBar() {
    const { width, height } = this.scale;
    const bar = this.add.graphics();
    this.load.on('progress', (p) => {
      bar.clear();
      bar.fillStyle(0x4a6fa5, 1);
      bar.fillRect(width / 2 - 80, height / 2 - 4, 160 * p, 8);
    });
    this.load.on('complete', () => bar.destroy());
  }

  // Generates a tiny top-down character texture (body + head + facing dot).
  // 24x28 px, origin at feet handled by the Player entity.
  makePlaceholderCharacter(key, bodyColor, accentColor) {
    if (this.textures.exists(key)) return;
    const w = 24;
    const h = 28;
    const g = this.make.graphics({ x: 0, y: 0 }, false);

    // shadow
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(w / 2, h - 3, 16, 6);
    // body
    g.fillStyle(bodyColor, 1);
    g.fillRoundedRect(w / 2 - 7, 10, 14, 15, 4);
    // accent (tunic stripe)
    g.fillStyle(accentColor, 1);
    g.fillRect(w / 2 - 7, 16, 14, 3);
    // head
    g.fillStyle(0xf0d8b8, 1);
    g.fillCircle(w / 2, 8, 6);

    g.generateTexture(key, w, h);
    g.destroy();
  }
}
