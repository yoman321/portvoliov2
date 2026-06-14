import Phaser from 'phaser';

// Minimal first scene: set up anything that must exist before assets load
// (e.g. a loading-bar texture), then hand off to PreloadScene.
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    this.scene.start('Preload');
  }
}
