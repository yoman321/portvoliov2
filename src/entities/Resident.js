import NPC from './NPC.js';

// A building's resident: an NPC you can talk to, opening its dialogue lines.
export default class Resident extends NPC {
  constructor(scene, x, y, { textureKey, role, lines }) {
    super(scene, x, y, { textureKey, role });
    this.lines = lines;
  }

  // Descriptor the scene pushes into its interactables: [E] talk → dialogue.
  interactable() {
    return {
      x: this.x,
      y: this.y,
      promptY: this.y - this.height - 14,
      range: 40,
      label: '[E] talk',
      action: (s) => s.openDialogue(this.role, this.lines),
    };
  }
}
