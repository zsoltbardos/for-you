# For You hk

A quiet, mobile-first gift — love, care, and hope at the end of the tunnel.

Two pages:

- **`index.html`** — the wordless film. Two lights find each other in the dark,
  orbit, and are bridged by warm light at dawn. No text; it just plays.
- **`letter.html`** — the worded letter. An airy, scroll-through piece that only
  hints at love, ending on three barely-visible words.

## Deploy to GitHub Pages

1. Create a new repository on GitHub (e.g. `for-you`).
2. Push this folder:

   ```bash
   git init
   git add .
   git commit -m "Add love page"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/for-you.git
   git push -u origin main
   ```

3. In the repo: **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: **main** / **/(root)**
4. Save. The site will be live at `https://YOUR_USERNAME.github.io/for-you/` within a minute or two.

## Preview locally

Open `index.html` in a browser, or run:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Customize

**The film (`index.html`, self-contained):**

- Pacing lives in the `DURATION` constant and the timeline phases inside `draw()`
  (`aIn`, `bIn`, `warmT`, `filament`, `sync`).
- `lightPos()` controls the orbit — how far apart the two lights start and how
  close they end up (they never quite meet).
- The cold→warm palette is in `paintBackground()` and the light colors
  `A_COOL/A_WARM`, `B_COOL/B_WARM`.

**The letter (`letter.html`, uses `css/style.css` + `js/main.js`):**

- Each `.panel` holds a short verse of `.verse__line` spans. Keep them brief.
- The three barely-visible words live in the `.whisper` element in the finale.
- Change `"— you know who."` (the `.sign__text`) to your name or sign-off.
- Palette and the cold→warm journey are in `css/style.css` under `:root`.
