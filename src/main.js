import Phaser from 'phaser';
import { PIXEL_SCALE, MIN_VIEW_WIDTH, MIN_VIEW_HEIGHT, COLORS } from './config.js';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import CabinExteriorScene from './scenes/CabinExteriorScene.js';
import InteriorScene from './scenes/InteriorScene.js';

// Size of the low-res render buffer for the current window. We divide the window
// by PIXEL_SCALE (round up so the upscaled canvas always covers the window — any
// fractional remainder is cropped by `overflow: hidden`) and clamp to a minimum
// so very small windows still get a sane amount of world on screen.
function viewSize() {
  return {
    width: Math.max(MIN_VIEW_WIDTH, Math.ceil(window.innerWidth / PIXEL_SCALE)),
    height: Math.max(MIN_VIEW_HEIGHT, Math.ceil(window.innerHeight / PIXEL_SCALE)),
  };
}

const initial = viewSize();

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: initial.width,
  height: initial.height,
  backgroundColor: COLORS.bg,
  pixelArt: true,
  scale: {
    // NONE + zoom: the canvas pixel buffer stays at our low-res size while CSS
    // scales it up by PIXEL_SCALE. We drive the buffer size ourselves on resize
    // (below) so the visible world tracks the window 1:1 at a fixed pixel scale.
    mode: Phaser.Scale.NONE,
    zoom: PIXEL_SCALE,
    // The #game div flex-centers the canvas; let it handle centering so the
    // (slightly oversized, then cropped) canvas isn't offset by margins too.
    autoCenter: Phaser.Scale.NO_CENTER,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 }, // top-down: no gravity
      debug: false, // flip to true to see physics bodies
    },
  },
  scene: [BootScene, PreloadScene, CabinExteriorScene, InteriorScene],
};

const game = new Phaser.Game(config);

// Keep the render buffer matched to the window. `scale.resize` updates the canvas
// pixel size (and, via zoom, its CSS size) and fires Scale's RESIZE event, which
// auto-resizes each scene's main camera; screen-pinned UI re-lays-out off that
// same event (see BaseWorldScene). Debounced to a frame to coalesce drag-resizes.
let resizeRaf = 0;
window.addEventListener('resize', () => {
  if (resizeRaf) return;
  resizeRaf = window.requestAnimationFrame(() => {
    resizeRaf = 0;
    const { width, height } = viewSize();
    game.scale.resize(width, height);
  });
});
