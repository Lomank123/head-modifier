# HeadMod — MV3 Header & Cookie Injector (Design)

Date: 2026-07-10
Status: Approved for planning

## Purpose

A personal Chrome (Manifest V3) extension to inject/modify/remove HTTP request
and response **headers** and **cookies** while testing the author's other
projects. A modern, lag-free popup UI with enable/disable toggles and multiple
profiles. This is a from-scratch analog of ModHeader's *legitimate* dev-tooling
core — no removed/abusive behavior.

## Background: how this works in Manifest V3

- MV3 removed the blocking `webRequest` API. Header modification is done with
  the **`declarativeNetRequest` (dNR) dynamic rules** API.
- dNR `modifyHeaders` supports whole-header `set` / `remove` / `append`
  operations. It cannot do granular per-cookie parsing (edit one cookie inside a
  header while preserving others) — this was ModHeader's MV3 migration pain point.
- **Cookies** are handled the same way ModHeader does: by modifying the `Cookie`
  request header and `Set-Cookie` response header — *not* by writing to the
  browser cookie jar. We use the **`append`** operation, which Chrome permits on
  `Cookie`/`Set-Cookie`, so injected cookies merge with the browser's existing
  cookies instead of clobbering them. Nothing is persisted to the cookie jar.

## Tech stack

- **Svelte + Vite + TypeScript** for the popup UI. Chosen for smallest bundle
  and fastest mount — the popup remounts on every icon click, so "no lag" maps
  directly to Svelte's strengths. Scope is small enough that ecosystem size is
  irrelevant.
- Background **service worker** in TypeScript.
- **`chrome.storage.local`** as the single source of truth (per-device, large
  quota). `sync` deferred.

## Architecture (one-way data flow)

```
Popup UI (Svelte)  --edit-->  chrome.storage.local  --onChanged-->  Service Worker  --updateDynamicRules-->  Chrome dNR engine
```

1. **Popup UI** — the only window. Renders the active profile, edits rows,
   switches profiles. Writes changes to `chrome.storage.local`. Never touches the
   network engine directly.
2. **Service worker (engine)** — subscribes to `storage.onChanged`, translates
   the *active* profile's *enabled* rows into dNR dynamic rules, and swaps them
   atomically via `updateDynamicRules`. Manages the toolbar badge (on/off +
   active-rule count).
3. **`chrome.storage.local`** — persisted shape:

```ts
type Rule = {
  id: string;
  enabled: boolean;
  name: string;
  value: string;
  target: 'request' | 'response';
};

type Profile = {
  id: string;
  name: string;
  urlFilter: string;   // '' = all URLs; otherwise a dNR urlFilter pattern
  headers: Rule[];
  cookies: Rule[];
};

type State = {
  profiles: Profile[];
  activeProfileId: string;
  globalEnabled: boolean;
  theme: 'light' | 'dark';
};
```

## Popup UI

- **Top bar:** profile dropdown (switch active), `+` new / rename / delete
  profile, master on/off switch (kills all injection instantly), light/dark
  toggle.
- **Tabs:** `Headers` and `Cookies`.
- **Row:** `[✓ enabled] [name] [value] [request/response toggle] [🗑]` plus an
  "add row" control per tab. Disabled rows are kept but greyed and not applied.
- **Per-profile URL filter:** one optional field. Blank = apply to all URLs.
- **Dark mode:** light/dark toggle, persisted in state; CSS variables for tokens
  (no hardcoded colors), respects the toggle.

## Engine → dNR mapping

- Header, `set`: `{ operation: 'set', header: name, value }` in `requestHeaders`
  (target=request) or `responseHeaders` (target=response).
- Header, empty value → treat as `remove`: `{ operation: 'remove', header }`.
- Cookie (request): append to `Cookie` header —
  `{ operation: 'append', header: 'cookie', value: 'name=value' }`.
- Cookie (response): append to `Set-Cookie` header —
  `{ operation: 'append', header: 'set-cookie', value: 'name=value' }`.
- Each rule's `condition.urlFilter` = profile `urlFilter` (or match-all when
  blank); `condition.resourceTypes` = all types for MVP.
- Rules rebuilt on every relevant storage change; when `globalEnabled` is false
  or no active profile, all dynamic rules are cleared.

## Error handling

- Rule generation wrapped so a malformed row can't break the whole rule set;
  invalid rows are skipped (and ideally surfaced in the UI later).
- `updateDynamicRules` failures logged; worker keeps last-known-good rules.
- Empty header/cookie names are ignored (not turned into rules).

## Testing strategy

- Unit-test the pure **profile → dNR rules** translation function (no Chrome APIs
  needed) — the core logic. Written test-first, one case at a time.
- Manual end-to-end verification: load unpacked, hit a test endpoint
  (e.g. httpbin/local project), confirm injected headers/cookies appear on the
  request and disabling/toggling profiles works.

## Out of MVP scope → the "next features" list

Resource-type / tab / tab-group / window filters; URL redirects; dynamic
variables; import/export/share profiles; cloud sync (`storage.sync`);
autocomplete for header names/values; comments per row; granular per-cookie
editing; CSP editor; append-vs-set mode toggle per row; undo history; sorting;
multiple simultaneously-active profiles; regex/value transforms; Firefox port.

## MVP definition of done

- Load-unpacked extension with popup, service worker, and manifest.
- Create/rename/delete/switch profiles; per-row enable/disable; master switch;
  dark mode; per-profile URL filter.
- Injects request + response headers and request + response cookies, verified
  end-to-end against a real request.
- Persists across browser restarts via `chrome.storage.local`.
