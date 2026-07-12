# Store assets

Chrome Web Store listing artwork. **None of this ships in the extension.**

Do not move these into `public/` — Vite copies `public/` verbatim into `dist/`, which is
the package users download. Listing artwork there would bloat the package for every user
while the extension never references it. Only the icons the manifest declares belong in
`public/`.

| File | Used for |
| --- | --- |
| `screenshot-1280x800.png` | Store listing screenshot (required; 1280×800) |
| `promo-440x280.png` | Small promo tile (optional) |
| `icon-512.png` | High-res master, kept as a source |

The 128×128 store-listing icon is uploaded from `public/icon-128.png`.

## src/

Generators, so the artwork can be rebuilt rather than hand-edited. Render in a browser and
capture the output:

- `icon.html` — the icon
- `promo.html` — the promo tile

To refresh the store screenshot, capture the real popup and frame it at 1280×800. Capture
from the actual extension, never from a mock — a mock drifts out of sync with the real UI.
