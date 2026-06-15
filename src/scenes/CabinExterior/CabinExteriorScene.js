import Phaser from 'phaser';
import { TILE, COLORS, DEPTH } from '../../config.js';
import BaseWorldScene from '../BaseWorldScene.js';
import Player from '../../entities/Player.js';
import { createFloor } from '../../prefab/createFloor.js';
import { createWall } from '../../prefab/createWall.js';
import { solidRect } from '../../prefab/solidRect.js';
import { createPortal } from '../../prefab/portal.js';
import { SIGN, SIGN_DANGER } from '../../ui/textStyles.js';
import {
  WORLD_W,
  WORLD_H,
  BORDER,
  BUILDING_TOP_WALK_IN,
  BUILDING_FRONT_PAD,
  BUILDINGS,
  PATHS,
  CAVE,
} from './constants.js';

export default class CabinExteriorScene extends BaseWorldScene {
  constructor() {
    super('CabinExterior');
  }

  create(data) {
    this.debugFacing = new URLSearchParams(window.location.search).get('facing');
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
    this.interactables = [];

    this.createGround();
    this.solids = this.physics.add.staticGroup();
    this.createForestBorder();
    BUILDINGS.forEach((b) => this.createBuilding(b));
    this.createDungeonEntrance();

    const spawn = this.spawnFor(data?.spawnDoor);
    this.player = new Player(this, spawn.x, spawn.y);
    this.physics.add.collider(this.player, this.solids);

    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.setupCommon();
  }

  // --- World -------------------------------------------------------------

  createGround() {
    // Grass base tiled across the whole map.
    createFloor(this, { key: 'grass', w: WORLD_W, h: WORLD_H, base: COLORS.grass, alt: COLORS.grassAlt });

    // Paths: a darker shoulder pass, then the surface, so overlapping segments
    // read as one continuous network.
    const p = this.add.graphics().setDepth(DEPTH.ground + 1);
    p.fillStyle(0x4a3a24, 1);
    PATHS.forEach((s) => p.fillRect(s.tx * TILE - 3, s.ty * TILE - 3, s.tw * TILE + 6, s.th * TILE + 6));
    p.fillStyle(COLORS.path, 1);
    PATHS.forEach((s) => p.fillRect(s.tx * TILE, s.ty * TILE, s.tw * TILE, s.th * TILE));
  }

  createForestBorder() {
    // A textured tree tile rings the map (no doorway); the canopy look stays
    // here, the band layout + colliders live in the createWall prefab.
    createWall(this, {
      solids: this.solids,
      w: WORLD_W,
      h: WORLD_H,
      thickness: BORDER * TILE,
      key: 'forest',
      depth: DEPTH.decorAbove,
      paint: (g) => {
        g.fillStyle(0x16301f, 1).fillRect(0, 0, TILE, TILE);
        g.fillStyle(0x1f4a2e, 1).fillCircle(8, 9, 9).fillCircle(24, 22, 10); // canopy clusters
        g.fillStyle(0x2e6440, 1).fillCircle(6, 7, 4).fillCircle(22, 20, 5); // highlights
      },
    });
  }

  createBuilding(b) {
    const left = b.col * TILE;
    const top = b.row * TILE;
    const w = b.w * TILE;
    const h = b.h * TILE;
    const cx = left + w / 2;
    const bottom = top + h;

    // Door at the bottom edge → the player always approaches from below, so the
    // whole building depth-sorts by its base (player passes in front when south).
    const g = this.add.graphics().setDepth(DEPTH.entities + bottom * 0.001);
    g.fillStyle(b.body, 1);
    g.fillRoundedRect(left, top, w, h, 4);
    g.fillStyle(b.roof, 1); // awning band along the top
    g.fillRect(left, top, w, TILE * 0.55);

    const doorW = TILE;
    const doorH = TILE;
    const doorX = cx - doorW / 2;
    const doorY = bottom - doorH;
    g.fillStyle(0x140f0a, 1);
    g.fillRect(doorX, doorY, doorW, doorH);
    g.lineStyle(2, b.roof, 1);
    g.strokeRect(doorX, doorY, doorW, doorH);

    // Doormat just outside the door (entrance marker).
    this.add
      .graphics()
      .setDepth(DEPTH.ground + 2)
      .fillStyle(0x6b5535, 1)
      .fillRoundedRect(doorX + 4, bottom, doorW - 8, 6, 2);

    const signText = b.sub ? `${b.name}\n${b.sub}` : b.name;
    this.add
      .text(cx, top - 6, signText, SIGN)
      .setOrigin(0.5, 1)
      .setDepth(DEPTH.ui);

    // Solid footprint: top edge pushed down (walk into the back), bottom edge
    // pushed out past the front so feet stop just shy of the wall.
    const bodyTop = top + BUILDING_TOP_WALK_IN;
    const bodyBottom = bottom + BUILDING_FRONT_PAD;
    const bodyH = bodyBottom - bodyTop;
    solidRect(this, this.solids, cx, bodyTop + bodyH / 2, w, bodyH);

    createPortal(this, {
      x: cx,
      y: bottom + 4,
      promptY: bottom - doorH - 6,
      range: 30,
      label: '[E] enter',
      to: 'Interior',
      data: { id: b.id },
    });
  }

  createDungeonEntrance() {
    // A rocky outcrop framing a cave mouth in the bottom-right corner.
    const g = this.add.graphics().setDepth(DEPTH.entities + (CAVE.y + TILE) * 0.001);
    g.fillStyle(0x4a4750, 1);
    g.fillRoundedRect(CAVE.x - TILE * 1.5, CAVE.y - TILE * 1.8, TILE * 3, TILE * 2.6, 8);
    g.fillStyle(0x3a3742, 1);
    g.fillRoundedRect(CAVE.x - TILE * 1.5, CAVE.y - TILE * 1.8, TILE * 3, TILE * 0.6, 8);
    g.fillStyle(0x0a0810, 1); // cave mouth
    g.fillEllipse(CAVE.x, CAVE.y - TILE * 0.2, TILE * 1.5, TILE * 1.9);

    this.add
      .text(CAVE.x, CAVE.y - TILE * 1.9, 'Dungeon', SIGN_DANGER)
      .setOrigin(0.5, 1)
      .setDepth(DEPTH.ui);

    // Solid rock so the player stops at the mouth.
    solidRect(this, this.solids, CAVE.x, CAVE.y - TILE * 0.7, TILE * 3, TILE * 1.6);

    createPortal(this, {
      x: CAVE.x,
      y: CAVE.y + 6,
      promptY: CAVE.y - TILE * 1.1,
      range: 38,
      label: '[E] enter',
      to: 'Interior',
      data: { id: 'dungeon' },
    });
  }

  // Where the player appears: just below the door/mouth they came out of, else
  // the default doorstep outside Home.
  spawnFor(id) {
    if (id === 'dungeon') return { x: CAVE.x, y: CAVE.y + TILE * 1.2 };
    const b = BUILDINGS.find((x) => x.id === id) || BUILDINGS.find((x) => x.id === 'home');
    const cx = b.col * TILE + (b.w * TILE) / 2;
    const bottom = (b.row + b.h) * TILE;
    return { x: cx, y: bottom + TILE * 1.2 };
  }
}
