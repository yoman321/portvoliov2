import Phaser from 'phaser';
import { TILE, DEPTH } from '../config.js';
import BaseWorldScene from './BaseWorldScene.js';
import Player from '../entities/Player.js';
import Resident from '../entities/Resident.js';
import { INTERIORS } from '../data/interiors.js';
import { NPCS } from '../data/portfolio.js';
import { createFloor } from '../prefab/createFloor.js';
import { createWall } from '../prefab/createWall.js';
import { createPortal } from '../prefab/portal.js';

// One generic interior, restarted with `{ id }` to render any room from
// interiors.js (the player's home or a shop). Walls are a solid border with a
// doorway gap at bottom-centre; [E] there returns to the exterior on the
// matching doorstep.
const WALL = 14; // wall thickness in px
const DOOR_W = TILE * 1.5; // doorway gap width

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
      .text(8, 6, this.def.name, {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#ffe066',
      })
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

      this.add
        .graphics()
        .setDepth(DEPTH.entities + bottom * 0.001 - 0.5)
        .fillStyle(p.color, 1)
        .fillRoundedRect(x, y, w, h, 3);

      const solid = p.solid ?? !p.decor;
      if (solid) {
        const b = this.solids.create(x + w / 2, y + h / 2, null);
        b.setVisible(false).setSize(w, h);
        b.body.updateFromGameObject();
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

    // Always-visible sign above the doorway so the exit is obvious at a glance
    // (the [E] leave prompt only appears once you're close).
    this.add
      .text(cx, H - WALL - 16, '▼ Exit', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#ffe066',
        align: 'center',
        backgroundColor: '#000000aa',
        padding: { x: 3, y: 2 },
      })
      .setOrigin(0.5, 1)
      .setDepth(DEPTH.ui);

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
