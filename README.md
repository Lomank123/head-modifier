# HeadMod

A Manifest V3 Chrome extension to inject/modify/remove HTTP request & response
headers and cookies, with a fast Svelte popup, per-row enable/disable, and
multiple profiles.

## Develop

```bash
npm install
npm run build   # outputs dist/
npm run dev     # HMR dev build
```

Load `dist/` via `chrome://extensions` → Developer mode → Load unpacked.

**Full step-by-step browser guide:** [docs/RUNNING.md](docs/RUNNING.md).

## How it works

- Header/cookie injection uses `declarativeNetRequest` dynamic rules — Chrome's
  native network engine applies them; no JS runs per request.
- Cookies are injected by appending to the `Cookie` / `Set-Cookie` headers
  (merge-safe); nothing is written to the browser cookie jar.
- Injection affects requests made *after* a rule goes live — reload the page to
  see changes on an already-loaded tab.

## Architecture

`popup (Svelte)` → `chrome.storage.local` → `service worker` → `dNR rules`.
See `docs/superpowers/specs/2026-07-10-headmod-header-injector-design.md`.
