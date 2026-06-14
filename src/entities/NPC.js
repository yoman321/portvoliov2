import Phaser from 'phaser';
import { DEPTH } from '../config.js';

// Base for stationary non-player characters placed in a scene: a feet-anchored
// sprite with a static body and an optional floating role label. Subclasses
// (e.g. Resident) add the interaction.
const BODY_W = 20;
const BODY_H = 12;

export default class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, { textureKey, role }) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body

    this.role = role;

    // Feet-anchored origin → depth-sorts against the player by world-y.
    this.setOrigin(0.5, 1).setDepth(DEPTH.entities + y * 0.001);
    this.body.setSize(BODY_W, BODY_H).setOffset((this.width - BODY_W) / 2, this.height - BODY_H);
    this.body.updateFromGameObject();

    if (role) {
      this.label = scene.add
        .text(x, y - this.height - 4, role, {
          fontFamily: 'monospace',
          fontSize: '8px',
          color: '#ffffff',
          backgroundColor: '#00000088',
          padding: { x: 3, y: 1 },
        })
        .setOrigin(0.5, 1)
        .setDepth(DEPTH.ui);
    }
  }
}
