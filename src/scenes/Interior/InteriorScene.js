import Phaser from 'phaser';
import { TILE, DEPTH } from '../../config.js';
import BaseWorldScene from '../BaseWorldScene.js';
import Player from '../../entities/Player.js';
import Resident from '../../entities/Resident.js';
import { INTERIORS } from '../../data/interiors.js';
import { NPCS } from '../../data/portfolio.js';
import { createFloor } from '../../prefab/createFloor.js';
import { createWall } from '../../prefab/createWall.js';
import { solidRect } from '../../prefab/solidRect.js';
import { createPortal } from '../../prefab/portal.js';
import { LABEL, SIGN } from '../../ui/textStyles.js';
import { WALL, DOOR_W, PROP_FOOT, PROP_FRONT_PAD } from './constants.js';

// One generic interior, restarted with `{ id }` to render any room from
// interiors.js (the player's home or a shop). Walls are a solid border with a
// doorway gap at bottom-centre; [E] there returns to the exterior on the
// matching doorstep.

export default class InteriorScene extends BaseWorldScene {
  constructor() {
    super('Interior');
  }

  create(data) {
    this.interiorId = data?.id && INTERIORS[data.id] ? data.id : 'home';
    this.def = INTERIORS[this.interiorId];
    this.debugFacing = new URLSearchParams(window.location.search).get('facing');
    this.interactables = [];
    this.resident = null;

    const W = this.def.cols * TILE;
    const H = this.def.rows * TILE;
    this.physics.world.setBounds(0, 0, W, H);

    createFloor(this, { key: `floor_${this.interiorId}`, w: W, h: H, base: this.def.floor, alt: this.def.floorAlt });
    this.solids = this.physics.add.staticGroup();
    this.createWalls(W, H);
    this.createProps();
    this.createResident();
    this.createExit(W, H);

    // Spawn just inside the doorway, facing into the room.
    this.player = new Player(this, W / 2, H - WALL - TILE);
    this.player.facing = 'up';
    this.physics.add.collider(this.player, this.solids);
    if (this.resident) this.physics.add.collider(this.player, this.resident);

    // A room is a small, fixed space — don't follow the player; keep the whole
    // room centred on screen, and re-centre whenever the window/buffer resizes.
    this.roomW = W;
    this.roomH = H;
    this.centerCamera();
    this.scale.on('resize', this.centerCamera, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.centerCamera, this));

    this.add
      .text(8, 6, this.def.name, LABEL)
      .setScrollFactor(0)
      .setDepth(DEPTH.ui);

    this.setupCommon();
  }

  // Centre the room in the view. camera.zoom is 1 (the pixel upscale lives on the
  // canvas/CSS), so this.scale.width/height are the visible world dimensions.
  centerCamera() {
    this.cameras.main.setScroll(
      this.roomW / 2 - this.scale.width / 2,
      this.roomH / 2 - this.scale.height / 2
    );
  }

  // --- World -------------------------------------------------------------


  createWalls(W, H) {
    // Flat-colour walls with a doorway gap; the segment layout + colliders live
    // in the createWall prefab, we just fill each segment with the room colour.
    const g = this.add.graphics().setDepth(DEPTH.decorBelow);
    g.fillStyle(this.def.wall, 1);
    createWall(this, {
      solids: this.solids,
      w: W,
      h: H,
      thickness: WALL,
      doorWidth: DOOR_W,
      render: (s) => g.fillRect(s.x, s.y, s.w, s.h),
    });
    g.fillStyle(this.def.accent, 0.25); // baseboard trim along the top wall
    g.fillRect(0, WALL, W, 2);
  }

  createProps() {
    this.def.props.forEach((p) => {
      const x = p.tx * TILE;
      const y = p.ty * TILE;
      const w = p.tw * TILE;
      const h = p.th * TILE;
      const bottom = y + h;

      const solid = p.solid ?? !p.decor;

      // Solid props depth-sort by their base like entities, so the player passes
      // BEHIND the upper part (and in front when standing below); flat decor
      // (rugs, banners) stays beneath everything.
      this.add
        .graphics()
        .setDepth(DEPTH.entities + bottom * 0.001 - (solid ? 0 : 0.5))
        .fillStyle(p.color, 1)
        .fillRoundedRect(x, y, w, h, 3);

      if (solid) {
        // Only the base is solid (its footprint): tall props can be walked behind.
        const footTop = bottom - Math.min(h, PROP_FOOT);
        const footBottom = bottom + PROP_FRONT_PAD;
        solidRect(this, this.solids, x + w / 2, (footTop + footBottom) / 2, w, footBottom - footTop);
      }

      // The mirror reflects you — [E] opens the About Me modal instead of a note.
      if (p.about) {
        this.addInteractable({
          x: x + w / 2,
          y: bottom,
          promptY: y - 6,
          range: 34,
          label: '[E] look',
          action: (s) => s.openAbout(),
        });
        return;
      }

      let lines = p.examine;
      if (p.wares && this.def.resident) {
        const projects = NPCS[this.def.resident].projects || [];
        lines = ['Wares on offer:', ...projects.map((pr) => `- ${pr.name}: ${pr.blurb}`)];
      }
      if (lines) {
        this.addInteractable({
          x: x + w / 2,
          y: bottom,
          promptY: y - 6,
          range: 34,
          label: '[E] look',
          action: (s) => s.openDialogue(p.name || 'Note', lines),
        });
      }
    });
  }

  createResident() {
    const rid = this.def.resident;
    if (!rid) return;
    const at = this.def.residentAt;
    const npc = NPCS[rid];

    this.resident = new Resident(this, at.tx * TILE + TILE / 2, at.ty * TILE + TILE, {
      textureKey: `npc_${rid}`,
      role: npc.role,
      lines: npc.lines,
    });
    this.addInteractable(this.resident.interactable());
  }

  createExit(W, H) {
    const cx = W / 2;
    const gx = cx - DOOR_W / 2; // left edge of the doorway gap

    // Daylight spilling in through the opening → reads as "outside this way".
    this.add
      .graphics()
      .setDepth(DEPTH.ground + 1)
      .fillStyle(0xf2e3a8, 1)
      .fillRect(gx, H - WALL, DOOR_W, WALL);

    // Door frame: accent posts flanking the gap + a lintel across the top, so the
    // opening reads as a real door rather than a hole in the wall.
    const frame = this.add.graphics().setDepth(DEPTH.decorBelow + 1);
    frame.fillStyle(this.def.accent, 1);
    frame.fillRect(gx - 3, H - WALL - 5, 3, WALL + 5); // left post
    frame.fillRect(gx + DOOR_W, H - WALL - 5, 3, WALL + 5); // right post
    frame.fillRect(gx - 3, H - WALL - 5, DOOR_W + 6, 3); // lintel

    // Threshold mat just inside the doorway on the floor.
    this.add
      .graphics()
      .setDepth(DEPTH.ground + 2)
      .fillStyle(0x6b5535, 1)
      .fillRoundedRect(gx + 4, H - WALL - 13, DOOR_W - 8, 11, 3);

    const locked = this.def.lockedExit;

    // Always-visible sign above the doorway so the exit is obvious at a glance
    // (the [E] prompt only appears once you're close). A locked door reads as a
    // shut door rather than a way out.
    this.add
      .text(cx, H - WALL - 16, locked ? '▼ Door' : '▼ Exit', {
        ...SIGN,
        fontSize: '9px',
        color: locked ? '#b0a080' : '#ffe066',
      })
      .setOrigin(0.5, 1)
      .setDepth(DEPTH.ui);

    if (locked) {
      // Sealed for now — interacting plays the locked message instead of leaving.
      this.addInteractable({
        x: cx,
        y: H - WALL,
        promptY: H - WALL - 38,
        range: 40,
        label: '[E] door',
        armOnLeave: true, // player spawns in the doorway — don't flash on spawn
        action: (s) => s.openDialogue('Door', locked),
      });
      return;
    }

    createPortal(this, {
      x: cx,
      y: H - WALL,
      promptY: H - WALL - 38, // sits a few px above the "▼ Exit" sign (no overlap)
      range: 40,
      label: '[E] leave',
      to: 'CabinExterior',
      data: { spawnDoor: this.interiorId },
      armOnLeave: true, // player spawns in the doorway — don't show until they step in
    });
  }
}
