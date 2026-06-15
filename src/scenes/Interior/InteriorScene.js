import Phaser from 'phaser';
import { TILE, DEPTH } from '../../config.js';
import BaseWorldScene from '../BaseWorldScene.js';
import Player from '../../entities/Player.js';
import Resident from '../../entities/Resident.js';
import InteriorObject from '../../entities/InteriorObject.js';
import Mirror from '../../entities/Mirror.js';
import Table from '../../entities/Table.js';
import Chair from '../../entities/Chair.js';
import Bed from '../../entities/Bed.js';
import { INTERIORS } from '../../data/interiors.js';
import { NPCS } from '../../data/portfolio.js';
import { createFloor } from '../../prefab/createFloor.js';
import { createWall } from '../../prefab/createWall.js';
import { createPortal } from '../../prefab/portal.js';
import { LABEL, SIGN } from '../../ui/textStyles.js';
import { WALL, BACK_WALL, DOOR_W, tileFrame } from './constants.js';

// Prop `type` → object class registry (defaults to a plain InteriorObject).
const OBJECT_TYPES = { table: Table, mirror: Mirror, chair: Chair, bed: Bed };

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

    // Whole floor tiled with the red indoor tile (frame 24); baked once, shared
    // across rooms.
    createFloor(this, { key: 'floor_indoor', w: W, h: H, tile: { sheet: 'indoor', frame: 24 } });
    this.solids = this.physics.add.staticGroup();
    this.createWalls(W, H);
    this.createSideBorders(W, H);
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
      topThickness: BACK_WALL,
      doorWidth: DOOR_W,
      render: (s) => g.fillRect(s.x, s.y, s.w, s.h),
    });
    this.shadeBackWall(g, W);
  }

  // Make the top (back) wall read as a real wall: a subtle top→bottom shading
  // gradient for depth, a darker "crown" band along the very top, and a light
  // baseboard line at the base marking the wall→floor change.
  shadeBackWall(g, W) {
    const wall = Phaser.Display.Color.IntegerToColor(this.def.wall);
    const crown = wall.clone().darken(40); // darkest, at the top edge

    // Vertical gradient: dark at the top, easing to the wall colour at the base.
    for (let y = 0; y < BACK_WALL; y++) {
      const c = Phaser.Display.Color.Interpolate.ColorWithColor(crown, wall, BACK_WALL, y);
      g.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b), 1);
      g.fillRect(0, y, W, 1);
    }

    // Crown band along the very top, and a highlight + baseboard at the base.
    g.fillStyle(crown.color, 1);
    g.fillRect(0, 0, W, 3);
    g.fillStyle(0xffffff, 0.12); // faint sheen just under the crown
    g.fillRect(0, 3, W, 1);
    g.fillStyle(0xc8c8c8, 1); // light baseboard line at the wall→floor change
    g.fillRect(0, BACK_WALL - 2, W, 2);
  }

  // Overlay the left and right edges with bordered indoor tiles (the wood runs
  // along the outer edge, red floor fills the rest). One TILE-wide column down
  // each side, sat above the flat wall fill. Colliders stay on the createWall body.
  createSideBorders(W, H) {
    const SIDE_LEFT = tileFrame(23, 3); // (row 3, col 23) — border on the left edge
    const SIDE_RIGHT = tileFrame(25, 3); // (row 3, col 25) — border on the right edge
    // Snap to the tile grid so the side columns line up with the baked floor
    // tiles (BACK_WALL isn't necessarily a multiple of TILE).
    const startY = Math.ceil(BACK_WALL / TILE) * TILE;
    for (let y = startY; y < H; y += TILE) {
      this.add.image(0, y, 'indoor', SIDE_LEFT)
        .setOrigin(0, 0).setDisplaySize(TILE, TILE).setDepth(DEPTH.decorBelow);
      this.add.image(W - TILE, y, 'indoor', SIDE_RIGHT)
        .setOrigin(0, 0).setDisplaySize(TILE, TILE).setDepth(DEPTH.decorBelow);
    }
  }

  createProps() {
    this.def.props.forEach((p) => {
      // Some props are their own object type (Mirror opens the About modal;
      // Table is solid over its whole footprint).
      const Type = OBJECT_TYPES[p.type] || (p.about ? Mirror : InteriorObject);
      const obj = new Type(this, p);

      // `wares` props auto-list the room resident's projects; otherwise the
      // object's own `examine` lines (if any) drive the interaction.
      let lines;
      if (p.wares && this.def.resident) {
        const projects = NPCS[this.def.resident].projects || [];
        lines = ['Wares on offer:', ...projects.map((pr) => `- ${pr.name}: ${pr.blurb}`)];
      }
      const interactable = obj.interactable(lines);
      if (interactable) this.addInteractable(interactable);
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
