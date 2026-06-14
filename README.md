# Portfolio — A 2D Explorer

An interactive portfolio built as a small top-down adventure game. Instead of a
scrolling page, you walk a pixel-art town: each shop is an NPC tied to a domain of
my work (systems, ML, web), and a dungeon at the edge of the map holds the
capstone project. Talk to the residents and explore to read the content.

Built with **[Phaser 3](https://phaser.io/)** + **[Vite](https://vitejs.dev/)** —
a static site, no backend.

## Run it locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
```

> **Note on art assets:** the sprite art lives in `public/assets/` and is **not**
> committed to this repo (see Credits below — the license permits *use* but not
> redistribution). To run the game locally, download the free **Mana Seed
> Character Base** demo and place it in `public/assets/`.

## Credits & thanks 🙏

The character sprites are the wonderful **Mana Seed** art by **Seliel the Shaper**.
Huge thanks for making such a lovely, well-documented asset base — this project
wouldn't look the way it does without it.

- Artist / itch.io: https://seliel-the-shaper.itch.io/
- Mana Seed Character Base: https://seliel-the-shaper.itch.io/character-base
- Website: https://selieltheshaper.weebly.com/

The art is used under the [Mana Seed user license](https://selieltheshaper.weebly.com/user-license.html).
The raw asset files are not redistributed here; please support the artist and grab
them directly from the links above.
