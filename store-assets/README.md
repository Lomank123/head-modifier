# Store assets

Chrome Web Store listing artwork. **None of this ships in the extension.**

Do not move these into `public/` — Vite copies `public/` verbatim into `dist/`, which is
the package users download. Listing artwork there would bloat the package for every user
while the extension never references it. Only the icons the manifest declares belong in
`public/`.

| File | Used for |
| --- | --- |
| `screenshot-1-1280x800.png` … `screenshot-5-1280x800.png` | Store listing screenshots (upload in numeric order; at least one required) |
| `promo-440x280.jpg` | Small promo tile (optional; RGB, no alpha) |
| `promo-marquee-1400x560.jpg` | Marquee promo tile (optional; RGB, no alpha) |
| `icon-512.png` | High-res master, kept as a source |

The 128×128 store-listing icon is uploaded from `public/icon-128.png`.

To refresh screenshots, capture the real popup at 1280×800 from the loaded extension — not
from a mock.
