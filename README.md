# For You

A quiet, mobile-first page — love, care, and hope at the end of the tunnel.

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

- Edit the lines in `index.html` — each `.panel` holds a short verse made of
  `.verse__line` spans. Keep them brief; the whole piece is built on restraint.
- The three barely-visible words live in the `.whisper` element in the finale.
- Change `"— you know who."` (the `.sign__text`) to your name or sign-off.
- Adjust the palette and the cold→warm journey in `css/style.css` under `:root`
  and the `.warmth` overlay.
- The two converging lights are drawn in `js/main.js` (`orbPositions` controls
  where they start and how close they end up).
