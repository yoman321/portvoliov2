import Phaser from 'phaser';
import { PLAYER, DEPTH } from '../config.js';

// Single composited LPC character. Movement: arrows + WASD, 4-directional.
// Anim keys follow the convention registered by charAnims.js:
// `player-walk-<dir>` / `player-idle-<dir>` (frames swap textures between the
// idle.png and walk.png sheets automatically).
export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player_idle');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.baseKey = 'player';
    this.facing = 'down';
    this.hasAnims = scene.anims.exists('player-idle-down');

    // Feet-anchored origin → depth sorting by y looks correct.
    this.setOrigin(0.5, 1);
    this.setScale(PLAYER.scale ?? 1);
    this.body.setSize(PLAYER.width, PLAYER.height);
    this.body.setOffset((this.width - PLAYER.width) / 2, this.height - PLAYER.height - 4);
    this.setCollideWorldBounds(true);

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
      this.applyDepth();
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
    this.applyDepth();
  }

  animate(moving) {
    const state = moving ? 'walk' : 'idle';
    if (this.hasAnims) {
      this.anims.play(`${this.baseKey}-${state}-${this.facing}`, true);
      return;
    }
    // Fallback for missing anims: bob + flip so movement still reads.
    this.setFlipX(this.facing === 'left');
    this.setScale(1, moving ? 1 + Math.sin(this.scene.time.now / 80) * 0.03 : 1);
  }

  // Depth-sort against other entities by world-y (feet origin).
  applyDepth() {
    this.setDepth(DEPTH.entities + this.y * 0.001);
  }
}
