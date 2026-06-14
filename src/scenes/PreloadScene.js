import Phaser from 'phaser';
import { COLORS } from '../config.js';
import { registerCharAnims } from '../entities/charAnims.js';

// Mana Seed page-1 sheets are 512x512 with 64px frames.
const MANA_FRAME = { frameWidth: 64, frameHeight: 64 };

// Player paper-doll layers, bottom → top. Swap the file (or the vNN colour
// variant) to restyle; the frame layout is identical across all parts.
const PLAYER_LAYERS = {
  player_base: 'assets/char_a_p1/char_a_p1_0bas_humn_v01.png',
  player_outfit: 'assets/char_a_p1/1out/char_a_p1_1out_fstr_v01.png',
  player_hair: 'assets/char_a_p1/4har/char_a_p1_4har_dap1_v01.png',
};

// Loads/generates art, then starts the first gameplay scene.
//
// Right now the player + NPC sprites are GENERATED programmer-art so the game
// runs with zero asset files. To swap in the real Mana Seed Character Base:
//   1. Drop the composited sheets in `public/assets/characters/`.
//   2. In `preload()` below, `this.load.spritesheet('player', ...)` with the
//      Mana Seed frame size (frameWidth/Height).
//   3. Define walk animations in `createCharacterAnims()` and delete the
//      matching `makePlaceholderCharacter()` call.
// Player.js reads animation keys by convention (`<key>-walk-<dir>` / `<key>-idle-<dir>`),
// so once the real anims exist no entity code changes.
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    this.drawLoadingBar();
    for (const [key, path] of Object.entries(PLAYER_LAYERS)) {
      this.load.spritesheet(key, path, MANA_FRAME);
    }
  }

  create() {
    // Real player: register the standard char anims for each paper-doll layer.
    Object.keys(PLAYER_LAYERS).forEach((key) => registerCharAnims(this, key));

    // NPCs still use generated placeholders until themed Mana Seed dolls land.
    this.makePlaceholderCharacter('npc_blacksmith', 0x9c4a3a, 0x2b2b2b);
    this.makePlaceholderCharacter('npc_alchemist', 0x6a4a9c, 0xc8e070);
    this.makePlaceholderCharacter('npc_merchant', 0x3a7a9c, 0xe0c060);

    this.scene.start('CabinExterior');
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
