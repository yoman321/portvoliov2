import InteriorObject from './InteriorObject.js';
import { openAboutModal } from '../ui/aboutModal.js';
import { PROFILE } from '../data/portfolio.js';

// The home Mirror: [E] opens the About Me modal (your reflection). It owns the
// interaction — calling the global openAboutModal directly — and freezes the
// scene's player until the modal closes. Prompt sits over the mirror.
export default class Mirror extends InteriorObject {
  interactable() {
    return {
      x: this.x + this.w / 2,
      y: this.bottom,
      promptY: this.y + this.h / 2,
      range: 34,
      label: '[E] look',
      action: (s) => this.open(s),
    };
  }

  open(scene) {
    if (scene.modalOpen) return;
    scene.modalOpen = true;
    scene.player?.setVelocity(0, 0);
    scene.prompt?.setVisible(false);
    openAboutModal({
      ...PROFILE,
      onClose: () => {
        scene.modalOpen = false;
      },
    });
  }
}
