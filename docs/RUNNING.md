# Running HeadMod in the Browser

A step-by-step guide to build, load, use, and reload the extension in Chrome
(works the same in Edge and Brave — any Chromium browser).

---

## 1. Build the extension

From the project root:

```bash
npm install      # first time only
npm run build    # produces the dist/ folder
```

You should see output ending in `✓ built in …ms` and a `dist/` folder
containing `manifest.json`, `service-worker-loader.js`, and `src/popup/…`.

> Everything Chrome loads lives in `dist/` — not `src/`. Always point Chrome at
> `dist/`.

---

## 2. Load it into Chrome

1. Open a new tab and go to **`chrome://extensions`**.
2. Turn on **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked** (top-left).
4. Select the **`dist/`** folder inside this project
   (`.../head-modifier/dist`).
5. The **HeadMod** card appears. Pin it: click the puzzle-piece icon in the
   toolbar, then the pin next to HeadMod so its icon is always visible.

You now have a HeadMod icon in the toolbar. Click it to open the popup.

---

## 3. Use it

1. **Click the HeadMod toolbar icon** — the popup opens.
2. **Headers tab** → click **`+ request header`**. Fill in a name and value,
   e.g. `X-Debug` = `1`.
3. The checkbox on the left enables/disables that row. The **`req`/`res`**
   button flips it between a request and a response header.
4. **Cookies tab** works the same — a row `sid` = `abc` injects `sid=abc` into
   the outgoing `Cookie` header (it is *appended*, so your real cookies are
   kept).
5. **Profiles** (top-left dropdown): `＋` new, `✎` rename, `🗑` delete. Switch
   the dropdown to change which profile is active. Only the **active** profile
   is applied.
6. **URL filter** (field under the toolbar row): leave blank to apply
   everywhere, or type e.g. `httpbin.org` to scope the whole profile to matching
   URLs.
7. **Master switch** (top-right `On`/`Off`): instantly disables all injection.
   The badge on the toolbar icon shows how many rules are active.
8. **Theme**: the 🌙 / ☀ button toggles dark/light. It is remembered.

> **Important:** injection only affects requests made **after** you add the
> rule. If a page is already open, **reload it** (or trigger a new request) to
> see the header/cookie.

---

## 4. Verify it actually works

1. Add a request header `X-HeadMod-Test` = `hello` (Headers tab).
2. In a new tab, open **`https://httpbin.org/headers`**.
3. The JSON response should include:
   `"X-Headmod-Test": "hello"`.
4. Uncheck the row → reload the page → the header is gone. Re-check → it's back.
5. For cookies: add `hm_sid` = `abc123` (Cookies tab), open
   **`https://httpbin.org/cookies`**, and confirm `hm_sid` appears.

---

## 5. Applying code changes

The loaded extension is a snapshot of `dist/`. After editing source:

**Option A — rebuild + reload (simplest):**

```bash
npm run build
```

Then on `chrome://extensions`, click the **circular reload icon** on the
HeadMod card. Close and reopen the popup.

**Option B — dev mode with hot reload:**

```bash
npm run dev
```

Leave it running. The `@crxjs` plugin rebuilds and reloads the extension
automatically as you edit. (You still load `dist/` once via **Load unpacked**
the first time.)

---

## 6. Debugging

- **Popup UI:** right-click the popup → **Inspect** to open its DevTools.
- **Background service worker:** on `chrome://extensions`, click
  **“service worker”** (or “Inspect views: service worker”) on the HeadMod card
  to see the worker console — errors from applying rules are logged there with
  the `[HeadMod]` prefix.
- **See the active rules:** in the service-worker console, run
  `await chrome.declarativeNetRequest.getDynamicRules()`.
- **Stored state:** in the same console,
  `await chrome.storage.local.get('headmod:state')`.

---

## 7. Common issues

| Symptom | Fix |
| --- | --- |
| Header not showing | Reload the target page — rules apply only to *new* requests. |
| Nothing applies at all | Check the master switch is **On** and the correct profile is active. |
| Applies only on some sites | Clear or fix the profile’s **URL filter**. |
| Popup shows old data after an edit | Reopen the popup; it rehydrates from storage. |
| Changes to code not reflected | Rebuild (`npm run build`) and click reload on the extension card. |
| “Manifest is not valid” on load | Make sure you selected the **`dist/`** folder, not the project root. |
