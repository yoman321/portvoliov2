# Portfolio Game — Project Summary

**Project:** 2D game portfolio site at `/Users/luoph/Desktop/portfoliov2`. Static, no backend, free hosting (leaning Vercel; GitHub Pages fallback).

**Stack:** Phaser 3 + Vite 8 (chosen over Godot to avoid its ~25MB WASM load). Node 25. `npm run dev` → localhost:5173. Build is green (~326 KB gzipped; art served from `public/`, not bundled). 0 npm vulnerabilities.

## Display / scaling

Game fills the whole window at a **constant pixel scale** — a bigger window shows MORE world, a smaller one less (no letterboxing). Implemented via `Phaser.Scale.NONE` + `zoom: PIXEL_SCALE` over a low-res buffer sized to `ceil(window / PIXEL_SCALE)`; `main.js` drives `game.scale.resize(...)` on window resize (rAF-debounced), which auto-resizes each scene's main camera. `config.js`: `PIXEL_SCALE` (currently 3 — bump to 4 for chunkier/less-world), plus `MIN_VIEW_WIDTH/HEIGHT` floors. Screen-pinned UI (dialogue box) re-lays-out via `BaseWorldScene.layoutDialogue()`, bound to the scale `resize` event.

**Concept:** Top-down explorer. Three scenes planned — cabin exterior, cabin interior, dungeon. NPCs/rooms map to specific portfolio domains (blacksmith = systems, alchemist = ML, merchant = web, dungeon boss = capstone); dialogue carries the content.

## Art (Mana Seed Character Animation Template)

Already in `public/assets/`. Page-1 sheets `char_a_p1*` are 512×512, **64px frames, 8×8 grid**.

- Rows 0–3 = stand / push / pull / jump (col 0 = idle)
- Rows 4–7 = walk (cols 0–5) + run (cols 6–7)
- Direction → row: `down=0, up=1, right=2, left=3`
- Layer codes: `0bas / 1out / 2clo / 3fac / 4har / 5hat / 6tla / 7tlb`; `vNN` = colour variant

## Done

- **`src/entities/charAnims.js`** — `registerCharAnims(scene, key)` builds idle/walk anims from the frame indices above.
- **`src/entities/Player.js`** — layered paper-doll (base `0bas_humn_v01` + forester `1out_fstr_v01` + hair `4har_dap1_v01`), WASD/arrows, 4-directional. All directions verified correct in-game. Has a `?facing=down|up|left|right` debug URL hook.
- **`src/scenes/BaseWorldScene.js`** — shared base for all walkable scenes: interaction prompt, dialogue box, nearest-interactable scan, and fade scene transitions. Scenes just build their world, make the player, and push `{x,y,promptY,range,label,action}` into `this.interactables`.
- **`src/scenes/CabinExteriorScene.js`** — **Pokémon-style 2D town** (26×18 tiles, 832×576) ringed by a textured, solid **forest border**. **Home** top-left, **Dungeon** (cave mouth in a rocky outcrop) bottom-right, shops between: **Smithy** top-right, **Market** center, **Apothecary** bottom-left. **Every door is on the building's bottom edge** (uniform face — old north/south `face` logic removed; buildings depth-sort by base, player passes in front when below; each has a doormat). A cosmetic **path network** (`PATHS` array, drawn as shoulder + surface) forms a loop every door opens onto, ending at the dungeon. `[E] enter` fades to the matching interior; returning spawns on that doorstep. Layout constants up top: `BUILDINGS` (tile `col/row/w/h`), `PATHS`, `COLS/ROWS`, `CAVE`.
- **`src/scenes/InteriorScene.js`** — one generic, data-driven interior (key `'Interior'`, restarted with `{id}`). Renders floor/walls with a bottom doorway, props, and the resident NPC; `[E] leave` returns to the exterior. Also renders the dungeon.
- **`src/data/interiors.js`** — room defs (home + 3 shops + **dungeon**) in tile coords: floor/wall colors, props (`examine`/`wares`/`decor`), and `resident` (links to `NPCS`). A `wares` prop auto-lists that NPC's projects. The dungeon's "boss" prop examines into `DUNGEON_BOSS`.
- NPCs live **inside** their shops (still placeholder blobs); `[E] talk`. Dungeon boss is a placeholder block for now.

## Remaining

1. Theme NPCs + buildings + dungeon with Mana Seed art (still placeholder blobs / flat-color rects).
2. Fill real project content in `src/data/portfolio.js` (currently TODO stubs) — flows into shop dialogue, `wares` props, and the dungeon boss automatically.
3. Flesh out the dungeon (real boss sprite/encounter; currently a minimal room reusing `InteriorScene`).
4. Deploy to Vercel.

**Next step:** fill real content in `portfolio.js`, or theme the art.

## Re-prompts (session log)

Verbatim prompts that drove the build, newest last — re-runnable / build-on records.

1. "we aren't going to add the good overlay of the sprites yet, build me the cabin for the player, and each shops for the nbc"
   → Added `BaseWorldScene`, generic `InteriorScene` + `interiors.js`; built Home + 3 shop interiors with door fade transitions; NPCs moved inside their shops (kept placeholder blobs).
2. "the map is too big, make it so that my home is most left most, a street connects to the rightmost to the dungeon, and the other npc shops are up or down from the main street"
   → Rebuilt exterior as a compact 28×11 street town: Home leftmost, dirt street left→right, shops branching above/below (door `face`), street's right end opens into a cliff-cave Dungeon (minimal boss room added to `interiors.js`).
3. "the game should fill the whole screen, if the screen is smaller, display less, if the screen is bigger, display more"
   → Replaced `Scale.FIT` (fixed 480×270, letterboxed) with constant-pixel-scale full-window rendering: `Scale.NONE` + `zoom` over a low-res buffer sized to the window; `main.js` resize listener drives `game.scale.resize`, cameras auto-resize, dialogue UI re-flows via `BaseWorldScene.layoutDialogue()`. See **Display / scaling**.
4. "follow [Pokémon-town reference image]: home top-left, dungeon bottom-right, shops laid out accordingly; each shop's entrance at the bottom of the shop"
   → Rebuilt exterior as a forest-bordered 26×18 2D town: Home top-left, Dungeon bottom-right, Smithy/Market/Apothecary between; all doors bottom-edge; cosmetic looping path network (`PATHS`) linking every door to the dungeon. Removed the north/south `face` logic.
