import { defineConfig } from 'vite';

// Static SPA. `base: './'` keeps asset paths relative so the same build
// works on Vercel (root) and GitHub Pages (sub-path) without changes.
export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1500, // Phaser is a big single chunk; that's fine.
  },
});
