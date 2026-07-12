# Publishing HeadMod to the Chrome Web Store

## 0. Before you start

Verify the extension actually works, loaded unpacked from `dist/`:

1. `npm run build`
2. `chrome://extensions` → enable Developer mode → **Load unpacked** → select `dist/`
3. Grant access to one site, add a header rule, and confirm in DevTools → Network →
   Request Headers that it is applied.
4. Confirm the rule does **not** apply on a site you have not granted.

Step 4 matters: the extension uses `declarativeNetRequestWithHostAccess`, so rules only
fire on granted hosts. If both checks pass, the permission model is correct.

## 1. Privacy policy URL

Already hosted as a public gist:

https://gist.github.com/Lomank123/b1c1cf96d2cd00cfac9be240418f0211

Keep it alive — a dead privacy-policy link is grounds for takedown. If `docs/PRIVACY.md`
changes, update the gist to match.

## 2. Build the package

```sh
npm run build
cd dist && zip -qr ../headmod-1.0.0.zip . -x '.*' '__MACOSX*' && cd ..
```

Zip the **contents** of `dist/`, not the folder. `manifest.json` must be at the zip root.
Verify with `unzip -l headmod-1.0.0.zip` — the first-level entries should be
`manifest.json`, `icon-*.png`, `assets/`, `src/`, `service-worker-loader.js`.

## 3. Upload

[Developer Dashboard](https://chrome.google.com/webstore/devconsole) → **Add new item** →
upload `headmod-1.0.0.zip`.

## 4. Fill the tabs

### Store listing

| Field | Value |
| --- | --- |
| Description | See `docs/STORE_SUBMISSION.md` |
| Category | Developer Tools |
| Icon (128×128) | `public/icon-128.png` |
| Screenshot (1280×800) | `store-assets/screenshot-1280x800.png` |
| Small promo tile (440×280) | `store-assets/promo-440x280.png` (optional) |

### Privacy

| Field | Source |
| --- | --- |
| Single purpose | `docs/STORE_SUBMISSION.md` → "Single purpose" |
| Permission justifications | `docs/STORE_SUBMISSION.md` → one per permission |
| Data use disclosures | `docs/STORE_SUBMISSION.md` → check every "does not" box |
| Privacy policy URL | The URL from step 1 |

There is a justification field for each of `declarativeNetRequestWithHostAccess`,
`storage`, `activeTab`, and the `<all_urls>` host permission. Fill all four.

### Distribution

Free · Public (or Unlisted to test first) · all regions.

### Test instructions

Only needed if a reviewer would otherwise be unable to exercise the extension. HeadMod
needs no login, so this can be left blank — though a one-line note that host access must
be granted from the popup before rules apply will not hurt.

## 5. Submit

Submit for review. Once approved you have **30 days** to publish before the submission
reverts to a draft.

## Updating later

Bump `version` in **both** `manifest.config.ts` and `package.json`, rebuild, rezip, and
upload as a new package. Store listing assets and text can be edited any time without a
code review.
