import Phaser from 'phaser';
import { PLAYER, DEPTH } from '../config.js';

// Layered Mana Seed character. The base body is the physics sprite; outfit and
// hair are overlay sprites kept locked to the base position and playing the
// same animation, so they read as one paper-doll character.
//
// Movement: arrows + WASD, 4-directional. Anim keys follow the convention
// registered by charAnims.js: `<texture>-walk-<dir>` / `<texture>-idle-<dir>`.
const OVERLAY_LAYERS = ['player_outfit', 'player_hair']; // bottom → top

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player_base');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.baseKey = 'player_base';
    this.facing = 'down';
    this.hasAnims = scene.anims.exists('player_base-idle-down');

    // Feet-anchored origin → depth sorting by y looks correct.
    this.setOrigin(0.5, 1);
    this.body.setSize(PLAYER.width, PLAYER.height);
    this.body.setOffset((this.width - PLAYER.width) / 2, this.height - PLAYER.height - 4);
    this.setCollideWorldBounds(true);

    // Overlay parts (skipped gracefully if a texture is missing).
    this.layers = OVERLAY_LAYERS.filter((k) => scene.textures.exists(k)).map((key) =>
      scene.add.sprite(x, y, key).setOrigin(0.5, 1)
    );

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys('W,A,S,D');
  }

  update() {
    const { speed } = PLAYER;
    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    const up = this.cursors.up.isDown || this.keys.W.isDown;
    const down = this.cursors.down.isDown || this.keys.S.isDown;

    let vx = (right ? 1 : 0) - (left ? 1 : 0);
    let vy = (down ? 1 : 0) - (up ? 1 : 0);

    // Normalise so diagonal isn't faster.
    if (vx !== 0 && vy !== 0) {
      const inv = Math.SQRT1_2;
      vx *= inv;
      vy *= inv;
    }
    this.setVelocity(vx * speed, vy * speed);

    // Debug hook: `?facing=down|up|left|right` walks in place for verifying
    // animations/art without driving the keyboard.
    if (this.scene.debugFacing) {
      this.setVelocity(0, 0);
      this.facing = this.scene.debugFacing;
      this.animate(true);
      this.syncLayers();
      return;
    }

    const moving = vx !== 0 || vy !== 0;
    if (moving) {
      // Prefer horizontal facing when both held (reads better).
      if (vx < 0) this.facing = 'left';
      else if (vx > 0) this.facing = 'right';
      else if (vy < 0) this.facing = 'up';
      else if (vy > 0) this.facing = 'down';
    }

    this.animate(moving);
    this.syncLayers();
  }

  animate(moving) {
    const state = moving ? 'walk' : 'idle';
    if (this.hasAnims) {
      this.anims.play(`${this.baseKey}-${state}-${this.facing}`, true);
      this.layers.forEach((s) => s.anims.play(`${s.texture.key}-${state}-${this.facing}`, true));
      return;
    }
    // Fallback for missing anims: bob + flip so movement still reads.
    this.setFlipX(this.facing === 'left');
    this.setScale(1, moving ? 1 + Math.sin(this.scene.time.now / 80) * 0.03 : 1);
  }

  // Keep overlays glued to the base sprite and stacked just above it,
  // while the whole stack depth-sorts against other entities by world-y.
  syncLayers() {
    const baseDepth = DEPTH.entities + this.y * 0.001;
    this.setDepth(baseDepth);
    this.layers.forEach((s, i) => {
      s.setPosition(this.x, this.y);
      s.setDepth(baseDepth + 0.0001 * (i + 1));
    });
  }
}
