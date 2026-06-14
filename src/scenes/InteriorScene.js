import Phaser from 'phaser';
import { TILE, DEPTH } from '../config.js';
import BaseWorldScene from './BaseWorldScene.js';
import Player from '../entities/Player.js';
import { INTERIORS } from '../data/interiors.js';
import { NPCS } from '../data/portfolio.js';

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

    this.createFloor(W, H);
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

    this.cameras.main.setBounds(0, 0, W, H);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

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

  // --- World -------------------------------------------------------------

  createFloor(W, H) {
    const key = `floor_${this.interiorId}`;
    if (!this.textures.exists(key)) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(this.def.floor, 1);
      g.fillRect(0, 0, TILE, TILE);
      g.fillStyle(this.def.floorAlt, 1);
      g.fillRect(0, 0, TILE / 2, TILE / 2);
      g.fillRect(TILE / 2, TILE / 2, TILE / 2, TILE / 2);
      g.generateTexture(key, TILE, TILE);
      g.destroy();
    }
    this.add.tileSprite(0, 0, W, H, key).setOrigin(0, 0).setDepth(DEPTH.ground);
  }

  createWalls(W, H) {
    const gapL = W / 2 - DOOR_W / 2;
    const gapR = W / 2 + DOOR_W / 2;

    const g = this.add.graphics().setDepth(DEPTH.decorBelow);
    g.fillStyle(this.def.wall, 1);
    g.fillRect(0, 0, W, WALL); // top
    g.fillRect(0, 0, WALL, H); // left
    g.fillRect(W - WALL, 0, WALL, H); // right
    g.fillRect(0, H - WALL, gapL, WALL); // bottom-left of doorway
    g.fillRect(gapR, H - WALL, W - gapR, WALL); // bottom-right of doorway
    g.fillStyle(this.def.accent, 0.25); // baseboard trim
    g.fillRect(0, WALL, W, 2);

    const addSolid = (cx, cy, w, h) => {
      const b = this.solids.create(cx, cy, null);
      b.setVisible(false).setSize(w, h);
      b.body.updateFromGameObject();
    };
    addSolid(W / 2, WALL / 2, W, WALL);
    addSolid(WALL / 2, H / 2, WALL, H);
    addSolid(W - WALL / 2, H / 2, WALL, H);
    addSolid(gapL / 2, H - WALL / 2, gapL, WALL);
    addSolid((W + gapR) / 2, H - WALL / 2, W - gapR, WALL);
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
    const x = at.tx * TILE + TILE / 2;
    const y = at.ty * TILE + TILE;

    const sprite = this.physics.add.staticSprite(x, y, `npc_${rid}`);
    sprite.setOrigin(0.5, 1).setDepth(DEPTH.entities + y * 0.001);
    sprite.body.setSize(20, 12).setOffset(2, sprite.height - 12);
    sprite.body.updateFromGameObject();

    this.add
      .text(x, y - sprite.height - 4, NPCS[rid].role, {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#ffffff',
        backgroundColor: '#00000088',
        padding: { x: 3, y: 1 },
      })
      .setOrigin(0.5, 1)
      .setDepth(DEPTH.ui);

    this.addInteractable({
      x,
      y,
      promptY: y - sprite.height - 14,
      range: 40,
      label: '[E] talk',
      action: (s) => s.openDialogue(NPCS[rid].role, NPCS[rid].lines),
    });

    this.resident = sprite;
  }

  createExit(W, H) {
    // Dark threshold inside the doorway gap, plus the [E] leave interactable.
    this.add
      .graphics()
      .setDepth(DEPTH.ground + 1)
      .fillStyle(0x140f0a, 1)
      .fillRect(W / 2 - DOOR_W / 2, H - WALL, DOOR_W, WALL);

    this.addInteractable({
      x: W / 2,
      y: H - WALL,
      promptY: H - WALL - 6,
      range: 40,
      label: '[E] leave',
      action: (s) => s.fadeTo('CabinExterior', { spawnDoor: this.interiorId }),
    });
  }
}
