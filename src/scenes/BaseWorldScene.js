import Phaser from 'phaser';
import { DEPTH } from '../config.js';
import { PROFILE } from '../data/portfolio.js';
import { openAboutModal, closeAboutModal } from '../ui/aboutModal.js';

// Shared base for every walkable scene (exterior town + interiors). It owns the
// reusable pieces — interaction prompt, dialogue box, the nearest-interactable
// scan, and fade transitions — so each concrete scene only has to build its
// world, create the player, and push entries into `this.interactables`.
//
// An interactable is a plain object:
//   { x, y, promptY?, range?, label?, action(scene) }
// `action` runs on [E]/Space when the player is within `range` of (x, y).
const DEFAULT_RANGE = 36;

export default class BaseWorldScene extends Phaser.Scene {
  // Subclasses call this at the end of create(), after the world + player exist
  // and `this.interactables` has been populated.
  setupCommon() {
    this.dialogue = { open: false, lines: [], index: 0 };
    this.nearby = null;
    this._transitioning = false;
    this.createInteractionUi();
    this.layoutDialogue();
    this.bindKeys();

    // Re-flow the screen-pinned dialogue box whenever the render buffer changes
    // size (window resize). The main camera is resized for us by Phaser.
    this.scale.on('resize', this.layoutDialogue, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.layoutDialogue, this);
      closeAboutModal(); // tear down any open DOM modal when the scene ends
      this.modalOpen = false;
    });

    this.cameras.main.fadeIn(200, 0, 0, 0);
  }

  addInteractable(obj) {
    if (!this.interactables) this.interactables = [];
    this.interactables.push(obj);
    return obj;
  }

  bindKeys() {
    this.input.keyboard.addKeys('E,SPACE');
    this.input.keyboard.on('keydown-E', () => this.onInteract());
    this.input.keyboard.on('keydown-SPACE', () => this.onInteract());
    this.input.keyboard.on('keydown-ESC', () => this.closeDialogue());
  }

  update() {
    if (!this.player) return;
    if (this._transitioning || this.dialogue.open || this.modalOpen) {
      this.player.setVelocity(0, 0);
      return;
    }
    this.player.update();
    this.updateNearest();
  }

  // --- Interaction -------------------------------------------------------

  updateNearest() {
    let nearest = null;
    let best = Infinity;
    for (const it of this.interactables) {
      const range = it.range ?? DEFAULT_RANGE;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, it.x, it.y);
      // `armOnLeave` interactables stay dormant on spawn (so arriving on top of
      // one — e.g. just inside an interior exit — doesn't flash its prompt), but
      // arm the instant the player moves back toward it (or leaves range). The
      // dot of velocity with the direction to the target is >0 when approaching,
      // so turning around toward the exit shows it immediately; moving deeper
      // into the room does not.
      if (it.armOnLeave && !it._armed) {
        const v = this.player.body.velocity;
        const towards = (it.x - this.player.x) * v.x + (it.y - this.player.y) * v.y;
        if (d > range || towards > 0) it._armed = true;
        else continue;
      }
      if (d <= range && d < best) {
        best = d;
        nearest = it;
      }
    }
    this.nearby = nearest;
    if (nearest) {
      this.prompt
        .setText(nearest.label || '[E]')
        .setPosition(nearest.x, nearest.promptY ?? nearest.y - 28)
        .setVisible(true);
    } else {
      this.prompt.setVisible(false);
    }
  }

  onInteract() {
    if (this.dialogue.open) {
      this.advanceDialogue();
    } else if (this.nearby && this.nearby.action) {
      this.nearby.action(this);
    }
  }

  fadeTo(sceneKey, data) {
    if (this._transitioning) return;
    this._transitioning = true;
    this.prompt.setVisible(false);
    this.closeDialogue();
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(sceneKey, data));
  }

  // --- Dialogue ----------------------------------------------------------

  createInteractionUi() {
    // Floating prompt, shown above the nearest interactable.
    this.prompt = this.add
      .text(0, 0, '[E]', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#ffe066',
      })
      .setOrigin(0.5, 1)
      .setDepth(DEPTH.ui)
      .setVisible(false);

    // Dialogue box pinned to the camera (scrollFactor 0). Positioned/sized in
    // layoutDialogue() so it can re-flow with the window.
    this.dialogueBg = this.add
      .rectangle(0, 0, 10, 10, 0x140f1e, 0.95)
      .setStrokeStyle(2, 0x4a6fa5)
      .setScrollFactor(0)
      .setDepth(DEPTH.ui)
      .setVisible(false);

    this.dialogueName = this.add
      .text(0, 0, '', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#ffe066',
      })
      .setScrollFactor(0)
      .setDepth(DEPTH.ui + 1)
      .setVisible(false);

    this.dialogueText = this.add
      .text(0, 0, '', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#ffffff',
        lineSpacing: 3,
      })
      .setScrollFactor(0)
      .setDepth(DEPTH.ui + 1)
      .setVisible(false);

    // Dim controls hint on the dialogue's top line so the player knows how to
    // advance and that Esc closes the chat.
    this.dialogueHint = this.add
      .text(0, 0, '[Space] next   [Esc] close', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#8a86a0',
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(DEPTH.ui + 1)
      .setVisible(false);
  }

  // Pins the dialogue box across the bottom of the current view. Safe to call
  // repeatedly (initial layout + every resize).
  layoutDialogue() {
    if (!this.dialogueBg) return;
    const { width, height } = this.scale;
    const boxH = 60;
    this.dialogueBg.setPosition(width / 2, height - boxH / 2 - 6).setSize(width - 24, boxH);
    this.dialogueName.setPosition(20, height - boxH - 2);
    this.dialogueText.setPosition(20, height - boxH + 12).setWordWrapWidth(width - 48);
    this.dialogueHint.setPosition(width - 20, height - boxH - 2);
  }

  openDialogue(name, lines) {
    if (!lines || lines.length === 0) return;
    this.dialogue = { open: true, lines, index: 0 };
    this.prompt.setVisible(false);
    [this.dialogueBg, this.dialogueName, this.dialogueText, this.dialogueHint].forEach((o) =>
      o.setVisible(true)
    );
    this.dialogueName.setText(name);
    this.dialogueText.setText(lines[0]);
  }

  advanceDialogue() {
    this.dialogue.index += 1;
    if (this.dialogue.index >= this.dialogue.lines.length) {
      this.closeDialogue();
      return;
    }
    this.dialogueText.setText(this.dialogue.lines[this.dialogue.index]);
  }

  closeDialogue() {
    if (!this.dialogue) return;
    this.dialogue.open = false;
    [this.dialogueBg, this.dialogueName, this.dialogueText, this.dialogueHint].forEach((o) =>
      o.setVisible(false)
    );
  }

  // --- About Me ----------------------------------------------------------

  // Opens the DOM "About Me" modal (the mirror) and freezes the player until it
  // closes. `modalOpen` is checked in update() to halt movement/interaction.
  openAbout() {
    if (this.modalOpen) return;
    this.modalOpen = true;
    this.player?.setVelocity(0, 0);
    this.prompt.setVisible(false);
    openAboutModal({
      ...PROFILE,
      onClose: () => {
        this.modalOpen = false;
      },
    });
  }
}
