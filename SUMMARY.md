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
5. "move the market to the right … put the apothecary right next to it" → "put them at the middle between all 4 roads" → "make the market a bit smaller … same for the apothecary and smithy, same size as the market"
   → Settled Market + Apothecary centred in the loop interior (the gap between the 4 roads), both `w:4 h:3`; Smithy also shrunk to `w:4`. Door stubs added to `PATHS` so the two centred shops still connect to the bottom road. All in `CabinExteriorScene.js` `BUILDINGS`/`PATHS` constants.
6. "add resistance to buildings … the top should let me walk ~33% into it (empty back)" → "front/sides I can still walk through" → "I can step a bit on the front" → "let ~33% of the sprite disappear behind the building" → "let a bit more disappear"
   → Found the real bug: textureless static bodies (`create(...,null)` + `setSize` + `updateFromGameObject`) collapse to a tiny box (`updateFromGameObject` resamples display size), so front/sides leaked. Added `solidRect(cx,cy,w,h)` helper (1×1 `'px'` texture + `setDisplaySize` + `refreshBody`); routed buildings, forest border, and dungeon rock through it. Building collider: top inset `BUILDING_TOP_WALK_IN` (28px → ~⅓+ of the 64px sprite hides behind the rear wall via feet-y depth sort), bottom extended `BUILDING_FRONT_PAD` (6px, to the doormat) so feet stop in front of the wall. Both are tunable constants at the top of the file.
7. "is everything safe to push to github?" / "can I use these assets in a public repo?"
   → Security clean (no secrets/env). Licensing blocker: Mana Seed art (Seliel the Shaper) — official user license PROHIBITS redistribution of the raw files, and crediting does NOT grant permission; a public repo with the PNGs = redistribution. *Using* them in the game / serving them on the deployed site is allowed (free demo, commercial OK). Resolution: gitignore `public/assets/` (fixed a `.public` typo → `public/assets/`), `git rm --cached` the 365 art files, and `git commit --amend` the root commit so the art is in NO history (nothing was pushed yet). Repo now tracks 17 code/config files only. **Deploy plan:** build locally (`npm run build` bakes on-disk `public/assets/` into `dist/`) then `vercel deploy --prebuilt` — keeps art off the public repo while the running site still serves it. (Vercel git-mode / GitHub Pages won't work for a public repo since they serve from committed files.) Also added `README.md` (project blurb + Seliel credit/links + "download the demo into public/assets" note).
8. "createFloor … can we make this a factory function? add it to a new dir … call it prefab" → "same for createBorder" → "createWall and createBorder can be the same factory object"
   → New **`src/prefab/`** toolkit of scene-agnostic builders: `createFloor(scene,{key,w,h,base,alt})` (checker floor, shared by exterior grass + every interior), `solidRect(scene,solids,cx,cy,w,h)` (the 1×1-texture collider lifted out of the exterior), and `createWall(scene,{solids,w,h,thickness,doorWidth?,key?,paint?,render?})` — one factory for BOTH the exterior forest border (textured, no door) and interior walls (flat `render` fill + centred doorway gap). Replaced the scenes' inline copies; the unify also fixed the interior's old buggy `addSolid` (textureless collider).
9. "the interior should always be screen centered"
   → Interiors no longer `startFollow` the player (a small room was clamped to the top-left). `InteriorScene.centerCamera()` scrolls so the room midpoint is at the viewport centre, using `this.scale.width/height` (camera.zoom is 1 — the pixel upscale is on the canvas/CSS); re-runs on the Scale `resize` event. Player still confined by physics world bounds.
10. "clearer indication of an exit from the interior" → "entrance/exits should be a prefab … the interaction is just an argument pointing to the destination … call it portal" → spawn/prompt polish
   → Interior exit got a visible doorway: daylight-filled threshold, accent frame (posts + lintel), threshold mat, and an always-on "▼ Exit" sign. New **`src/prefab/portal.js`** `createPortal(scene,{x,y,promptY,range,label,to,data,armOnLeave})` owns the entrance/exit *interaction* (registers the [E] interactable, `action` fades to `to` with `data`); visuals stay per-scene. Now powers building doors, dungeon mouth, and interior exit (replaced all inline `fadeTo` interactables). `armOnLeave` keeps a portal you spawn on dormant until the player moves TOWARD it (velocity·direction > 0) or leaves range — so the interior exit prompt is hidden on spawn but appears the instant you step back toward it (logic in `BaseWorldScene.updateNearest`). Also nudged the [E]-leave prompt above the Exit sign so they don't overlap.
11. "dialogue should remind that Escape exits the chat"
   → Added a dim `[Space] next   [Esc] close` hint on the dialogue box's top line (right-aligned by the speaker name), shown/hidden with the box and re-laid-out on resize (`BaseWorldScene`).
12. "resident should be an entity placed in the scene, not procedural scene code" → "resident should extend a class called npc instead"
   → New entity hierarchy: **`src/entities/NPC.js`** (base — feet-anchored static sprite + body + optional role label) and **`src/entities/Resident.js`** `extends NPC` (adds `lines` + `interactable()` → `[E] talk`/`openDialogue`). `InteriorScene.createResident()` shrank to `new Resident(...) ; addInteractable(resident.interactable())`. Leaves room for other NPC subclasses (e.g. an examine-only dungeon boss).
