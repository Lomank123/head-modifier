# HeadMod Header & Cookie Injector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Manifest V3 Chrome extension that injects/modifies/removes HTTP request & response headers and cookies via a fast Svelte popup with enable/disable toggles and multiple profiles.

**Architecture:** One-way data flow: the Svelte popup edits state in `chrome.storage.local`; a background service worker observes storage changes, translates the active profile into `declarativeNetRequest` dynamic rules, and swaps them atomically. No JavaScript runs per network request — Chrome's native engine applies the rules.

**Tech Stack:** TypeScript, Svelte 4, Vite, `@crxjs/vite-plugin` (MV3 build), Vitest (unit tests), `@types/chrome`, `chrome.declarativeNetRequest` dynamic rules, `chrome.storage.local`.

## Global Constraints

- Manifest V3 only. Header/cookie modification MUST use `declarativeNetRequest` dynamic rules — never the blocking `webRequest` API.
- Cookies are injected via the `Cookie` / `Set-Cookie` headers using the `append` operation. Never write to the browser cookie jar.
- Single source of truth is `chrome.storage.local`. No `storage.sync` in MVP.
- No hardcoded colors/spacing/fonts in components — use CSS variables (design tokens) in `src/popup/styles/tokens.css`. Support light and dark themes.
- All state-mutation and rule-generation logic lives in pure, unit-tested functions; Svelte components and the worker are thin glue.
- One dNR rule per enabled row. Rows with an empty `name` produce no rule.
- Header row with empty `value` → `remove` operation. Non-empty → `set`.

---

## File Structure

```
head-modifier/
├── package.json                     # deps + scripts (Task 1)
├── tsconfig.json                    # TS config (Task 1)
├── vite.config.ts                   # Vite + crxjs + vitest (Task 1)
├── manifest.config.ts               # MV3 manifest (Task 1)
├── src/
│   ├── types.ts                     # Rule, Profile, State, RuleTarget (Task 2)
│   ├── state/
│   │   ├── defaults.ts              # createDefaultState / createProfile / createRule (Task 2)
│   │   ├── operations.ts            # pure state transforms (Task 3)
│   │   └── operations.test.ts       # (Task 3)
│   ├── engine/
│   │   ├── buildRules.ts            # State -> chrome dNR Rule[] (Task 4)
│   │   └── buildRules.test.ts       # (Task 4)
│   ├── background/
│   │   ├── syncRules.ts             # syncDynamicRules(state, dnr) + computeBadge (Task 5)
│   │   ├── syncRules.test.ts        # (Task 5)
│   │   └── worker.ts                # service worker glue (Task 5)
│   ├── state/store.ts               # Svelte store backed by storage.local (Task 6)
│   └── popup/
│       ├── index.html               # popup entry (Task 6)
│       ├── main.ts                  # mounts App (Task 6)
│       ├── App.svelte               # top-level layout (Task 6)
│       ├── components/
│       │   ├── TopBar.svelte        # profile switch, master toggle, theme toggle (Task 7)
│       │   ├── Tabs.svelte          # Headers / Cookies tabs (Task 7)
│       │   ├── RuleList.svelte      # list + add-row for one section (Task 7)
│       │   └── RuleRow.svelte       # single editable row (Task 7)
│       └── styles/
│           └── tokens.css           # design tokens, light/dark (Task 6)
```

---

## Task 1: Toolchain scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `manifest.config.ts`, `src/sanity.test.ts`
- Create: `.gitignore`

**Interfaces:**
- Produces: working `npm test` (Vitest) and `npm run build` (crxjs MV3 bundle into `dist/`).

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "headmod",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "@crxjs/vite-plugin": "^2.0.0-beta.28",
    "@sveltejs/vite-plugin-svelte": "^3.1.2",
    "@tsconfig/svelte": "^5.0.4",
    "@types/chrome": "^0.0.268",
    "svelte": "^4.2.19",
    "svelte-check": "^3.8.6",
    "typescript": "^5.5.4",
    "vite": "^5.4.8",
    "vitest": "^2.1.2"
  }
}
```

- [ ] **Step 2: Create `.gitignore`**

```
node_modules/
dist/
*.log
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "extends": "@tsconfig/svelte/tsconfig.json",
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "types": ["chrome", "vitest/globals"],
    "isolatedModules": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts", "src/**/*.svelte", "vite.config.ts", "manifest.config.ts"]
}
```

- [ ] **Step 4: Create `manifest.config.ts`**

```ts
import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'HeadMod',
  version: '0.1.0',
  description: 'Inject and modify HTTP request/response headers and cookies.',
  action: { default_popup: 'src/popup/index.html', default_title: 'HeadMod' },
  background: { service_worker: 'src/background/worker.ts', type: 'module' },
  permissions: ['declarativeNetRequest', 'storage'],
  host_permissions: ['<all_urls>'],
});
```

- [ ] **Step 5: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.config';

export default defineConfig({
  plugins: [svelte(), crx({ manifest })],
  test: { environment: 'node', globals: true },
});
```

- [ ] **Step 6: Create `src/sanity.test.ts`**

```ts
import { describe, it, expect } from 'vitest';

describe('toolchain', () => {
  it('runs vitest', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 7: Install and run the test**

Run: `npm install && npm test`
Expected: 1 passing test (`toolchain > runs vitest`).

- [ ] **Step 8: Verify the build works**

Run: `npm run build`
Expected: build succeeds, `dist/manifest.json` exists.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold MV3 extension toolchain (vite, crxjs, svelte, vitest)"
```

---

## Task 2: Domain types & default-state factories

**Files:**
- Create: `src/types.ts`, `src/state/defaults.ts`

**Interfaces:**
- Produces:
  - `type RuleTarget = 'request' | 'response'`
  - `type Rule = { id: string; enabled: boolean; name: string; value: string; target: RuleTarget }`
  - `type Profile = { id: string; name: string; urlFilter: string; headers: Rule[]; cookies: Rule[] }`
  - `type Theme = 'light' | 'dark'`
  - `type State = { profiles: Profile[]; activeProfileId: string; globalEnabled: boolean; theme: Theme }`
  - `createRule(target: RuleTarget): Rule`
  - `createProfile(name: string): Profile`
  - `createDefaultState(): State`

- [ ] **Step 1: Create `src/types.ts`**

```ts
export type RuleTarget = 'request' | 'response';

export interface Rule {
  id: string;
  enabled: boolean;
  name: string;
  value: string;
  target: RuleTarget;
}

export interface Profile {
  id: string;
  name: string;
  urlFilter: string; // '' = all URLs
  headers: Rule[];
  cookies: Rule[];
}

export type Theme = 'light' | 'dark';

export interface State {
  profiles: Profile[];
  activeProfileId: string;
  globalEnabled: boolean;
  theme: Theme;
}
```

- [ ] **Step 2: Create `src/state/defaults.ts`**

```ts
import type { Profile, Rule, RuleTarget, State } from '../types';

function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

export function createRule(target: RuleTarget = 'request'): Rule {
  return { id: uid(), enabled: true, name: '', value: '', target };
}

export function createProfile(name: string): Profile {
  return { id: uid(), name, urlFilter: '', headers: [], cookies: [] };
}

export function createDefaultState(): State {
  const profile = createProfile('Default');
  return {
    profiles: [profile],
    activeProfileId: profile.id,
    globalEnabled: true,
    theme: 'light',
  };
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add domain types and default-state factories"
```

---

## Task 3: Pure state operations (TDD)

**Files:**
- Create: `src/state/operations.ts`, `src/state/operations.test.ts`

**Interfaces:**
- Consumes: `State`, `Profile`, `Rule`, `RuleTarget` from `../types`; `createProfile`, `createRule` from `./defaults`.
- Produces (all pure, return a new `State`, never mutate input):
  - `getActiveProfile(state: State): Profile | undefined`
  - `addProfile(state: State, name: string): State` (new profile becomes active)
  - `renameProfile(state: State, id: string, name: string): State`
  - `deleteProfile(state: State, id: string): State` (never deletes the last profile; if active deleted, first remaining becomes active)
  - `setActiveProfile(state: State, id: string): State`
  - `addRow(state: State, section: 'headers' | 'cookies', target: RuleTarget): State`
  - `updateRow(state: State, section: 'headers' | 'cookies', rule: Rule): State`
  - `deleteRow(state: State, section: 'headers' | 'cookies', ruleId: string): State`
  - `setUrlFilter(state: State, filter: string): State`
  - `setGlobalEnabled(state: State, enabled: boolean): State`
  - `setTheme(state: State, theme: Theme): State`
  - Section edits (`addRow`/`updateRow`/`deleteRow`/`setUrlFilter`) apply to the **active** profile.

- [ ] **Step 1: Write failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { createDefaultState, createProfile } from './defaults';
import {
  getActiveProfile, addProfile, renameProfile, deleteProfile, setActiveProfile,
  addRow, updateRow, deleteRow, setUrlFilter, setGlobalEnabled, setTheme,
} from './operations';

describe('state operations', () => {
  it('addProfile appends and activates a new profile', () => {
    const s0 = createDefaultState();
    const s1 = addProfile(s0, 'Staging');
    expect(s1.profiles).toHaveLength(2);
    expect(getActiveProfile(s1)!.name).toBe('Staging');
    expect(s0.profiles).toHaveLength(1); // input not mutated
  });

  it('renameProfile changes only the target profile name', () => {
    const s0 = createDefaultState();
    const id = s0.profiles[0].id;
    const s1 = renameProfile(s0, id, 'Prod');
    expect(s1.profiles[0].name).toBe('Prod');
  });

  it('deleteProfile refuses to delete the last profile', () => {
    const s0 = createDefaultState();
    const s1 = deleteProfile(s0, s0.profiles[0].id);
    expect(s1.profiles).toHaveLength(1);
  });

  it('deleteProfile reassigns active when active is removed', () => {
    const s0 = addProfile(createDefaultState(), 'Two');
    const activeId = s0.activeProfileId;
    const s1 = deleteProfile(s0, activeId);
    expect(s1.profiles).toHaveLength(1);
    expect(s1.activeProfileId).toBe(s1.profiles[0].id);
  });

  it('setActiveProfile switches active id', () => {
    const s0 = addProfile(createDefaultState(), 'Two');
    const firstId = s0.profiles[0].id;
    const s1 = setActiveProfile(s0, firstId);
    expect(s1.activeProfileId).toBe(firstId);
  });

  it('addRow adds a row to the active profile section', () => {
    const s1 = addRow(createDefaultState(), 'headers', 'request');
    expect(getActiveProfile(s1)!.headers).toHaveLength(1);
    expect(getActiveProfile(s1)!.headers[0].target).toBe('request');
  });

  it('updateRow replaces a row by id', () => {
    const s1 = addRow(createDefaultState(), 'cookies', 'request');
    const row = getActiveProfile(s1)!.cookies[0];
    const s2 = updateRow(s1, 'cookies', { ...row, name: 'sid', value: 'abc' });
    expect(getActiveProfile(s2)!.cookies[0].name).toBe('sid');
  });

  it('deleteRow removes a row by id', () => {
    const s1 = addRow(createDefaultState(), 'headers', 'request');
    const row = getActiveProfile(s1)!.headers[0];
    const s2 = deleteRow(s1, 'headers', row.id);
    expect(getActiveProfile(s2)!.headers).toHaveLength(0);
  });

  it('setUrlFilter updates active profile filter', () => {
    const s1 = setUrlFilter(createDefaultState(), 'example.com');
    expect(getActiveProfile(s1)!.urlFilter).toBe('example.com');
  });

  it('setGlobalEnabled and setTheme update top-level flags', () => {
    const s1 = setGlobalEnabled(createDefaultState(), false);
    expect(s1.globalEnabled).toBe(false);
    const s2 = setTheme(s1, 'dark');
    expect(s2.theme).toBe('dark');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- operations`
Expected: FAIL (module `./operations` not found / functions undefined).

- [ ] **Step 3: Implement `src/state/operations.ts`**

```ts
import type { Profile, Rule, RuleTarget, State, Theme } from '../types';
import { createProfile, createRule } from './defaults';

type Section = 'headers' | 'cookies';

export function getActiveProfile(state: State): Profile | undefined {
  return state.profiles.find((p) => p.id === state.activeProfileId);
}

function mapActiveProfile(
  state: State,
  fn: (p: Profile) => Profile,
): State {
  return {
    ...state,
    profiles: state.profiles.map((p) =>
      p.id === state.activeProfileId ? fn(p) : p,
    ),
  };
}

export function addProfile(state: State, name: string): State {
  const profile = createProfile(name);
  return {
    ...state,
    profiles: [...state.profiles, profile],
    activeProfileId: profile.id,
  };
}

export function renameProfile(state: State, id: string, name: string): State {
  return {
    ...state,
    profiles: state.profiles.map((p) => (p.id === id ? { ...p, name } : p)),
  };
}

export function deleteProfile(state: State, id: string): State {
  if (state.profiles.length <= 1) return state;
  const profiles = state.profiles.filter((p) => p.id !== id);
  const activeProfileId =
    state.activeProfileId === id ? profiles[0].id : state.activeProfileId;
  return { ...state, profiles, activeProfileId };
}

export function setActiveProfile(state: State, id: string): State {
  if (!state.profiles.some((p) => p.id === id)) return state;
  return { ...state, activeProfileId: id };
}

export function addRow(state: State, section: Section, target: RuleTarget): State {
  return mapActiveProfile(state, (p) => ({
    ...p,
    [section]: [...p[section], createRule(target)],
  }));
}

export function updateRow(state: State, section: Section, rule: Rule): State {
  return mapActiveProfile(state, (p) => ({
    ...p,
    [section]: p[section].map((r) => (r.id === rule.id ? rule : r)),
  }));
}

export function deleteRow(state: State, section: Section, ruleId: string): State {
  return mapActiveProfile(state, (p) => ({
    ...p,
    [section]: p[section].filter((r) => r.id !== ruleId),
  }));
}

export function setUrlFilter(state: State, filter: string): State {
  return mapActiveProfile(state, (p) => ({ ...p, urlFilter: filter }));
}

export function setGlobalEnabled(state: State, enabled: boolean): State {
  return { ...state, globalEnabled: enabled };
}

export function setTheme(state: State, theme: Theme): State {
  return { ...state, theme };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- operations`
Expected: all state-operations tests PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add pure state operations with tests"
```

---

## Task 4: Rule-building engine (TDD) — the core

**Files:**
- Create: `src/engine/buildRules.ts`, `src/engine/buildRules.test.ts`

**Interfaces:**
- Consumes: `State`, `Profile`, `Rule` from `../types`.
- Produces: `buildRules(state: State): chrome.declarativeNetRequest.Rule[]`
  - Returns `[]` when `globalEnabled` is false or there is no active profile.
  - Emits one rule per **enabled** row of the active profile whose `name` is non-empty (trimmed).
  - Rule ids are sequential integers starting at 1.
  - `priority: 1`, `action.type: 'modifyHeaders'`.
  - Header rows: `set` when value non-empty, `remove` when value empty, on `requestHeaders`/`responseHeaders` per `target`.
  - Cookie rows: `append` on `cookie` (request) / `set-cookie` (response) with value `` `${name}=${value}` ``.
  - `condition.resourceTypes` = ALL_RESOURCE_TYPES; `condition.urlFilter` set only when profile `urlFilter` is non-empty.

- [ ] **Step 1: Write failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { createDefaultState } from '../state/defaults';
import { addRow, updateRow, getActiveProfile, setUrlFilter, setGlobalEnabled } from '../state/operations';
import { buildRules } from './buildRules';
import type { State } from '../types';

// helper: add a header row and set its fields on the active profile
function withHeader(state: State, fields: Partial<{ name: string; value: string; enabled: boolean; target: 'request' | 'response' }>) {
  const s1 = addRow(state, 'headers', fields.target ?? 'request');
  const row = getActiveProfile(s1)!.headers.at(-1)!;
  return updateRow(s1, 'headers', { ...row, name: '', value: '', enabled: true, ...fields });
}

describe('buildRules', () => {
  it('returns [] when globalEnabled is false', () => {
    const s = setGlobalEnabled(withHeader(createDefaultState(), { name: 'X', value: '1' }), false);
    expect(buildRules(s)).toEqual([]);
  });

  it('builds a request header set rule', () => {
    const s = withHeader(createDefaultState(), { name: 'Authorization', value: 'Bearer x', target: 'request' });
    const rules = buildRules(s);
    expect(rules).toHaveLength(1);
    expect(rules[0].id).toBe(1);
    expect(rules[0].action.type).toBe('modifyHeaders');
    expect(rules[0].action.requestHeaders).toEqual([
      { header: 'Authorization', operation: 'set', value: 'Bearer x' },
    ]);
  });

  it('builds a remove rule when value is empty', () => {
    const s = withHeader(createDefaultState(), { name: 'Referer', value: '', target: 'request' });
    expect(buildRules(s)[0].action.requestHeaders).toEqual([
      { header: 'Referer', operation: 'remove' },
    ]);
  });

  it('builds a response header rule on responseHeaders', () => {
    const s = withHeader(createDefaultState(), { name: 'X-Frame-Options', value: 'ALLOW', target: 'response' });
    const action = buildRules(s)[0].action;
    expect(action.responseHeaders).toEqual([
      { header: 'X-Frame-Options', operation: 'set', value: 'ALLOW' },
    ]);
    expect(action.requestHeaders).toBeUndefined();
  });

  it('builds a request cookie append rule', () => {
    let s = createDefaultState();
    s = addRow(s, 'cookies', 'request');
    const row = getActiveProfile(s)!.cookies[0];
    s = updateRow(s, 'cookies', { ...row, name: 'sid', value: 'abc' });
    expect(buildRules(s)[0].action.requestHeaders).toEqual([
      { header: 'cookie', operation: 'append', value: 'sid=abc' },
    ]);
  });

  it('builds a response cookie append on set-cookie', () => {
    let s = createDefaultState();
    s = addRow(s, 'cookies', 'response');
    const row = getActiveProfile(s)!.cookies[0];
    s = updateRow(s, 'cookies', { ...row, name: 'sid', value: 'abc' });
    expect(buildRules(s)[0].action.responseHeaders).toEqual([
      { header: 'set-cookie', operation: 'append', value: 'sid=abc' },
    ]);
  });

  it('skips disabled rows and empty-name rows', () => {
    let s = withHeader(createDefaultState(), { name: 'A', value: '1', enabled: false });
    s = withHeader(s, { name: '', value: '2' });
    expect(buildRules(s)).toEqual([]);
  });

  it('assigns sequential ids to multiple rules', () => {
    let s = withHeader(createDefaultState(), { name: 'A', value: '1' });
    s = withHeader(s, { name: 'B', value: '2' });
    expect(buildRules(s).map((r) => r.id)).toEqual([1, 2]);
  });

  it('adds urlFilter to the condition when profile filter is set', () => {
    const s = setUrlFilter(withHeader(createDefaultState(), { name: 'A', value: '1' }), 'example.com');
    expect(buildRules(s)[0].condition.urlFilter).toBe('example.com');
  });

  it('omits urlFilter when profile filter is blank', () => {
    const s = withHeader(createDefaultState(), { name: 'A', value: '1' });
    expect(buildRules(s)[0].condition.urlFilter).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- buildRules`
Expected: FAIL (`buildRules` not found).

- [ ] **Step 3: Implement `src/engine/buildRules.ts`**

```ts
import type { Profile, Rule, State } from '../types';

type DNRRule = chrome.declarativeNetRequest.Rule;
type HeaderInfo = chrome.declarativeNetRequest.ModifyHeaderInfo;

const ALL_RESOURCE_TYPES: chrome.declarativeNetRequest.ResourceType[] = [
  'main_frame', 'sub_frame', 'stylesheet', 'script', 'image', 'font',
  'object', 'xmlhttprequest', 'ping', 'csp_report', 'media', 'websocket', 'other',
] as chrome.declarativeNetRequest.ResourceType[];

function headerInfoForHeaderRow(rule: Rule): HeaderInfo {
  const value = rule.value;
  if (value === '') return { header: rule.name, operation: 'remove' as chrome.declarativeNetRequest.HeaderOperation };
  return { header: rule.name, operation: 'set' as chrome.declarativeNetRequest.HeaderOperation, value };
}

function headerInfoForCookieRow(rule: Rule): HeaderInfo {
  const header = rule.target === 'request' ? 'cookie' : 'set-cookie';
  return {
    header,
    operation: 'append' as chrome.declarativeNetRequest.HeaderOperation,
    value: `${rule.name}=${rule.value}`,
  };
}

function isActiveRow(rule: Rule): boolean {
  return rule.enabled && rule.name.trim() !== '';
}

export function buildRules(state: State): DNRRule[] {
  if (!state.globalEnabled) return [];
  const profile: Profile | undefined = state.profiles.find(
    (p) => p.id === state.activeProfileId,
  );
  if (!profile) return [];

  const rules: DNRRule[] = [];
  let id = 1;

  const emit = (rule: Rule, info: HeaderInfo) => {
    const action: chrome.declarativeNetRequest.RuleAction = {
      type: 'modifyHeaders' as chrome.declarativeNetRequest.RuleActionType,
    };
    if (rule.target === 'request') action.requestHeaders = [info];
    else action.responseHeaders = [info];

    const condition: chrome.declarativeNetRequest.RuleCondition = {
      resourceTypes: ALL_RESOURCE_TYPES,
    };
    if (profile.urlFilter.trim() !== '') condition.urlFilter = profile.urlFilter;

    rules.push({ id: id++, priority: 1, action, condition });
  };

  for (const row of profile.headers) {
    if (isActiveRow(row)) emit(row, headerInfoForHeaderRow(row));
  }
  for (const row of profile.cookies) {
    if (isActiveRow(row)) emit(row, headerInfoForCookieRow(row));
  }

  return rules;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- buildRules`
Expected: all buildRules tests PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add declarativeNetRequest rule builder with tests"
```

---

## Task 5: Background sync engine + service worker (TDD for the pure part)

**Files:**
- Create: `src/background/syncRules.ts`, `src/background/syncRules.test.ts`, `src/background/worker.ts`

**Interfaces:**
- Consumes: `buildRules` from `../engine/buildRules`; `State` from `../types`.
- Produces:
  - `computeBadge(state: State): { text: string; enabled: boolean }` — badge text is the active rule count (from `buildRules`), or `''` when disabled; `enabled` is `state.globalEnabled`.
  - `async syncDynamicRules(state, dnr): Promise<void>` where `dnr` is a minimal interface:
    ```ts
    interface DnrApi {
      getDynamicRules(): Promise<chrome.declarativeNetRequest.Rule[]>;
      updateDynamicRules(opts: { removeRuleIds?: number[]; addRules?: chrome.declarativeNetRequest.Rule[] }): Promise<void>;
    }
    ```
    Removes all existing dynamic rule ids and adds the freshly built rules in one call.

- [ ] **Step 1: Write failing tests**

```ts
import { describe, it, expect, vi } from 'vitest';
import { createDefaultState } from '../state/defaults';
import { addRow, updateRow, getActiveProfile, setGlobalEnabled } from '../state/operations';
import { computeBadge, syncDynamicRules } from './syncRules';
import type { State } from '../types';

function oneHeader(): State {
  let s = createDefaultState();
  s = addRow(s, 'headers', 'request');
  const row = getActiveProfile(s)!.headers[0];
  return updateRow(s, 'headers', { ...row, name: 'A', value: '1' });
}

describe('computeBadge', () => {
  it('shows rule count when enabled', () => {
    expect(computeBadge(oneHeader())).toEqual({ text: '1', enabled: true });
  });
  it('shows empty text when globally disabled', () => {
    expect(computeBadge(setGlobalEnabled(oneHeader(), false))).toEqual({ text: '', enabled: false });
  });
});

describe('syncDynamicRules', () => {
  it('removes existing rule ids and adds newly built rules', async () => {
    const dnr = {
      getDynamicRules: vi.fn().mockResolvedValue([{ id: 7 }, { id: 8 }]),
      updateDynamicRules: vi.fn().mockResolvedValue(undefined),
    };
    await syncDynamicRules(oneHeader(), dnr as any);
    const call = dnr.updateDynamicRules.mock.calls[0][0];
    expect(call.removeRuleIds).toEqual([7, 8]);
    expect(call.addRules).toHaveLength(1);
    expect(call.addRules[0].id).toBe(1);
  });

  it('clears rules when disabled (no addRules)', async () => {
    const dnr = {
      getDynamicRules: vi.fn().mockResolvedValue([{ id: 1 }]),
      updateDynamicRules: vi.fn().mockResolvedValue(undefined),
    };
    await syncDynamicRules(setGlobalEnabled(oneHeader(), false), dnr as any);
    const call = dnr.updateDynamicRules.mock.calls[0][0];
    expect(call.removeRuleIds).toEqual([1]);
    expect(call.addRules).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- syncRules`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/background/syncRules.ts`**

```ts
import type { State } from '../types';
import { buildRules } from '../engine/buildRules';

export interface DnrApi {
  getDynamicRules(): Promise<chrome.declarativeNetRequest.Rule[]>;
  updateDynamicRules(opts: {
    removeRuleIds?: number[];
    addRules?: chrome.declarativeNetRequest.Rule[];
  }): Promise<void>;
}

export function computeBadge(state: State): { text: string; enabled: boolean } {
  if (!state.globalEnabled) return { text: '', enabled: false };
  const count = buildRules(state).length;
  return { text: count === 0 ? '' : String(count), enabled: true };
}

export async function syncDynamicRules(state: State, dnr: DnrApi): Promise<void> {
  const existing = await dnr.getDynamicRules();
  const removeRuleIds = existing.map((r) => r.id);
  const addRules = buildRules(state);
  await dnr.updateDynamicRules({ removeRuleIds, addRules });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- syncRules`
Expected: all syncRules tests PASS.

- [ ] **Step 5: Implement `src/background/worker.ts` (thin glue, not unit-tested)**

```ts
import type { State } from '../types';
import { createDefaultState } from '../state/defaults';
import { syncDynamicRules, computeBadge } from './syncRules';

const STORAGE_KEY = 'headmod:state';

async function loadState(): Promise<State> {
  const raw = await chrome.storage.local.get(STORAGE_KEY);
  return (raw[STORAGE_KEY] as State) ?? createDefaultState();
}

async function apply(state: State): Promise<void> {
  try {
    await syncDynamicRules(state, chrome.declarativeNetRequest);
    const badge = computeBadge(state);
    await chrome.action.setBadgeText({ text: badge.text });
    await chrome.action.setBadgeBackgroundColor({
      color: badge.enabled ? '#2563eb' : '#9ca3af',
    });
  } catch (err) {
    console.error('[HeadMod] failed to apply rules', err);
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  await apply(await loadState());
});

chrome.runtime.onStartup.addListener(async () => {
  await apply(await loadState());
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[STORAGE_KEY]) {
    void apply(changes[STORAGE_KEY].newValue as State);
  }
});
```

- [ ] **Step 6: Typecheck and full test run**

Run: `npx tsc --noEmit && npm test`
Expected: no TS errors; all tests pass.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add background sync engine, badge, and service worker glue"
```

---

## Task 6: Svelte store + popup shell + design tokens (dark mode)

**Files:**
- Create: `src/state/store.ts`, `src/popup/index.html`, `src/popup/main.ts`, `src/popup/App.svelte`, `src/popup/styles/tokens.css`

**Interfaces:**
- Consumes: state operations from `../state/operations`; `createDefaultState` from `../state/defaults`; types from `../types`.
- Produces:
  - `store`: a Svelte writable-like store of `State` that hydrates from `chrome.storage.local` on load and persists (debounced) on every change under key `'headmod:state'`.
  - `update(fn: (s: State) => State): void` helper used by components.
  - Popup renders `App.svelte` which sets `data-theme` on `<html>` from `state.theme`.
- Note: same `STORAGE_KEY = 'headmod:state'` as the worker (Task 5).

- [ ] **Step 1: Create `src/state/store.ts`**

```ts
import { writable } from 'svelte/store';
import type { State } from '../types';
import { createDefaultState } from './defaults';

const STORAGE_KEY = 'headmod:state';

function createStore() {
  const { subscribe, set, update } = writable<State>(createDefaultState());
  let saveTimer: ReturnType<typeof setTimeout> | undefined;

  // Hydrate from storage on load.
  chrome.storage.local.get(STORAGE_KEY).then((raw) => {
    if (raw[STORAGE_KEY]) set(raw[STORAGE_KEY] as State);
  });

  function persist(state: State, immediate: boolean) {
    if (saveTimer) clearTimeout(saveTimer);
    const write = () => void chrome.storage.local.set({ [STORAGE_KEY]: state });
    if (immediate) write();
    else saveTimer = setTimeout(write, 300);
  }

  return {
    subscribe,
    // immediate=true for toggles/structural changes, false for text typing
    apply(fn: (s: State) => State, immediate = true) {
      update((s) => {
        const next = fn(s);
        persist(next, immediate);
        return next;
      });
    },
  };
}

export const store = createStore();
```

- [ ] **Step 2: Create `src/popup/styles/tokens.css`**

```css
:root {
  --bg: #ffffff;
  --surface: #f5f6f8;
  --border: #d8dbe0;
  --text: #1f2430;
  --text-muted: #6b7280;
  --accent: #2563eb;
  --danger: #dc2626;
  --disabled: #9ca3af;
  --radius: 6px;
  --gap: 8px;
  --font: -apple-system, system-ui, sans-serif;
}

:root[data-theme='dark'] {
  --bg: #1b1e26;
  --surface: #23262f;
  --border: #363a45;
  --text: #e6e8ee;
  --text-muted: #9aa0ac;
  --accent: #3b82f6;
  --danger: #f87171;
  --disabled: #565b66;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  width: 380px;
  font-family: var(--font);
  font-size: 13px;
  color: var(--text);
  background: var(--bg);
}
```

- [ ] **Step 3: Create `src/popup/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="stylesheet" href="./styles/tokens.css" />
    <title>HeadMod</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="./main.ts"></script>
  </body>
</html>
```

- [ ] **Step 4: Create `src/popup/main.ts`**

```ts
import App from './App.svelte';

const app = new App({ target: document.getElementById('app')! });
export default app;
```

- [ ] **Step 5: Create a minimal `src/popup/App.svelte` (placeholder body, real theme wiring)**

```svelte
<script lang="ts">
  import { store } from '../state/store';
  $: document.documentElement.setAttribute('data-theme', $store.theme);
</script>

<main>
  <p>HeadMod loaded. Active profile: {$store.profiles.find((p) => p.id === $store.activeProfileId)?.name}</p>
</main>

<style>
  main { padding: var(--gap); }
</style>
```

- [ ] **Step 6: Build and load unpacked to verify the popup renders**

Run: `npm run build`
Then in Chrome: `chrome://extensions` → enable Developer mode → Load unpacked → select `dist/`.
Expected: clicking the toolbar icon shows "HeadMod loaded. Active profile: Default". Toggling `state.theme` (temporarily default to 'dark' in `createDefaultState` to check, then revert) flips colors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add svelte store, popup shell, and design tokens with dark mode"
```

---

## Task 7: Full popup UI — profiles, tabs, rows, reactivity

**Files:**
- Modify: `src/popup/App.svelte`
- Create: `src/popup/components/TopBar.svelte`, `src/popup/components/Tabs.svelte`, `src/popup/components/RuleList.svelte`, `src/popup/components/RuleRow.svelte`

**Interfaces:**
- Consumes: `store` from `../state/store`; operations from `../state/operations`; types from `../types`.
- Reactivity rules (from spec): checkbox toggle, add/delete row, profile switch, master switch, theme toggle → `store.apply(fn, true)` (immediate persist). Name/value text typing → `store.apply(fn, false)` (debounced persist).

- [ ] **Step 1: Create `src/popup/components/RuleRow.svelte`**

```svelte
<script lang="ts">
  import type { Rule } from '../../types';
  export let rule: Rule;
  export let onChange: (rule: Rule, immediate: boolean) => void;
  export let onDelete: (id: string) => void;

  function toggleEnabled() { onChange({ ...rule, enabled: !rule.enabled }, true); }
  function setName(e: Event) { onChange({ ...rule, name: (e.target as HTMLInputElement).value }, false); }
  function setValue(e: Event) { onChange({ ...rule, value: (e.target as HTMLInputElement).value }, false); }
  function toggleTarget() {
    onChange({ ...rule, target: rule.target === 'request' ? 'response' : 'request' }, true);
  }
</script>

<div class="row" class:disabled={!rule.enabled}>
  <input type="checkbox" checked={rule.enabled} on:change={toggleEnabled} title="Enable/disable" />
  <input class="name" placeholder="name" value={rule.name} on:input={setName} />
  <input class="value" placeholder="value" value={rule.value} on:input={setValue} />
  <button class="target" on:click={toggleTarget} title="Toggle request/response">
    {rule.target === 'request' ? 'req' : 'res'}
  </button>
  <button class="del" on:click={() => onDelete(rule.id)} title="Delete">✕</button>
</div>

<style>
  .row { display: flex; align-items: center; gap: 6px; padding: 3px 0; }
  .row.disabled .name, .row.disabled .value { color: var(--disabled); }
  input.name, input.value {
    flex: 1; min-width: 0; padding: 4px 6px;
    border: 1px solid var(--border); border-radius: var(--radius);
    background: var(--bg); color: var(--text); font-size: 12px;
  }
  button {
    border: 1px solid var(--border); background: var(--surface); color: var(--text);
    border-radius: var(--radius); cursor: pointer; padding: 3px 6px; font-size: 11px;
  }
  button.del { color: var(--danger); border-color: transparent; background: transparent; }
</style>
```

- [ ] **Step 2: Create `src/popup/components/RuleList.svelte`**

```svelte
<script lang="ts">
  import type { Rule, RuleTarget } from '../../types';
  import { store } from '../../state/store';
  import { addRow, updateRow, deleteRow } from '../../state/operations';
  import RuleRow from './RuleRow.svelte';

  export let section: 'headers' | 'cookies';
  export let rows: Rule[];

  function onChange(rule: Rule, immediate: boolean) {
    store.apply((s) => updateRow(s, section, rule), immediate);
  }
  function onDelete(id: string) {
    store.apply((s) => deleteRow(s, section, id), true);
  }
  function add(target: RuleTarget) {
    store.apply((s) => addRow(s, section, target), true);
  }
</script>

<div class="list">
  {#each rows as row (row.id)}
    <RuleRow rule={row} {onChange} {onDelete} />
  {/each}
  {#if rows.length === 0}
    <p class="empty">No {section} yet.</p>
  {/if}
  <div class="actions">
    <button on:click={() => add('request')}>+ request {section === 'cookies' ? 'cookie' : 'header'}</button>
    <button on:click={() => add('response')}>+ response {section === 'cookies' ? 'cookie' : 'header'}</button>
  </div>
</div>

<style>
  .list { padding: var(--gap); }
  .empty { color: var(--text-muted); font-size: 12px; margin: 4px 0; }
  .actions { display: flex; gap: 6px; margin-top: 8px; }
  .actions button {
    border: 1px dashed var(--border); background: transparent; color: var(--accent);
    border-radius: var(--radius); cursor: pointer; padding: 5px 8px; font-size: 12px;
  }
</style>
```

- [ ] **Step 3: Create `src/popup/components/Tabs.svelte`**

```svelte
<script lang="ts">
  export let tabs: string[];
  export let active: string;
  export let onSelect: (tab: string) => void;
</script>

<div class="tabs">
  {#each tabs as tab}
    <button class:active={tab === active} on:click={() => onSelect(tab)}>{tab}</button>
  {/each}
</div>

<style>
  .tabs { display: flex; border-bottom: 1px solid var(--border); }
  button {
    flex: 1; padding: 8px; border: none; background: transparent; cursor: pointer;
    color: var(--text-muted); font-size: 13px; border-bottom: 2px solid transparent;
  }
  button.active { color: var(--text); border-bottom-color: var(--accent); font-weight: 600; }
</style>
```

- [ ] **Step 4: Create `src/popup/components/TopBar.svelte`**

```svelte
<script lang="ts">
  import type { State } from '../../types';
  import { store } from '../../state/store';
  import {
    addProfile, deleteProfile, renameProfile, setActiveProfile,
    setGlobalEnabled, setTheme, getActiveProfile, setUrlFilter,
  } from '../../state/operations';

  export let state: State;
  $: active = getActiveProfile(state);

  function switchProfile(e: Event) {
    store.apply((s) => setActiveProfile(s, (e.target as HTMLSelectElement).value), true);
  }
  function newProfile() {
    const name = prompt('New profile name?');
    if (name) store.apply((s) => addProfile(s, name), true);
  }
  function rename() {
    if (!active) return;
    const name = prompt('Rename profile', active.name);
    if (name) store.apply((s) => renameProfile(s, active!.id, name), true);
  }
  function remove() {
    if (active && confirm(`Delete profile "${active.name}"?`)) {
      store.apply((s) => deleteProfile(s, active!.id), true);
    }
  }
  function toggleGlobal() { store.apply((s) => setGlobalEnabled(s, !s.globalEnabled), true); }
  function toggleTheme() { store.apply((s) => setTheme(s, s.theme === 'dark' ? 'light' : 'dark'), true); }
  function onFilter(e: Event) {
    store.apply((s) => setUrlFilter(s, (e.target as HTMLInputElement).value), false);
  }
</script>

<header>
  <div class="line">
    <select on:change={switchProfile} value={state.activeProfileId}>
      {#each state.profiles as p (p.id)}
        <option value={p.id}>{p.name}</option>
      {/each}
    </select>
    <button on:click={newProfile} title="New profile">＋</button>
    <button on:click={rename} title="Rename">✎</button>
    <button on:click={remove} title="Delete">🗑</button>
    <span class="spacer"></span>
    <button on:click={toggleTheme} title="Theme">{state.theme === 'dark' ? '☀' : '🌙'}</button>
    <label class="master" title="Master on/off">
      <input type="checkbox" checked={state.globalEnabled} on:change={toggleGlobal} />
      {state.globalEnabled ? 'On' : 'Off'}
    </label>
  </div>
  <input class="filter" placeholder="URL filter (blank = all URLs)"
         value={active?.urlFilter ?? ''} on:input={onFilter} />
</header>

<style>
  header { padding: var(--gap); border-bottom: 1px solid var(--border); background: var(--surface); }
  .line { display: flex; align-items: center; gap: 4px; }
  .spacer { flex: 1; }
  select {
    flex: 0 1 auto; max-width: 150px; padding: 4px; border-radius: var(--radius);
    border: 1px solid var(--border); background: var(--bg); color: var(--text);
  }
  button {
    border: 1px solid var(--border); background: var(--bg); color: var(--text);
    border-radius: var(--radius); cursor: pointer; padding: 3px 6px;
  }
  .master { display: flex; align-items: center; gap: 3px; font-size: 12px; }
  .filter {
    width: 100%; margin-top: 6px; padding: 5px 6px; font-size: 12px;
    border: 1px solid var(--border); border-radius: var(--radius);
    background: var(--bg); color: var(--text);
  }
</style>
```

- [ ] **Step 5: Rewrite `src/popup/App.svelte` to compose everything**

```svelte
<script lang="ts">
  import { store } from '../state/store';
  import { getActiveProfile } from '../state/operations';
  import TopBar from './components/TopBar.svelte';
  import Tabs from './components/Tabs.svelte';
  import RuleList from './components/RuleList.svelte';

  let activeTab = 'Headers';
  $: document.documentElement.setAttribute('data-theme', $store.theme);
  $: profile = getActiveProfile($store);
</script>

<TopBar state={$store} />
<Tabs tabs={['Headers', 'Cookies']} active={activeTab} onSelect={(t) => (activeTab = t)} />

{#if profile}
  {#if activeTab === 'Headers'}
    <RuleList section="headers" rows={profile.headers} />
  {:else}
    <RuleList section="cookies" rows={profile.cookies} />
  {/if}
{/if}
```

- [ ] **Step 6: Typecheck and build**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors; `dist/` rebuilt.

- [ ] **Step 7: Manual end-to-end verification**

Reload the unpacked extension in `chrome://extensions` (click the refresh icon on the HeadMod card).

Verify each:
1. Popup opens instantly; profile dropdown shows "Default".
2. Create a profile "Test" → it becomes active; switch back and forth.
3. On the Headers tab, add a request header `X-HeadMod-Test` = `hello`.
4. Open a new tab to `https://httpbin.org/headers` (or your local project) → confirm the response shows `"X-Headmod-Test": "hello"`.
5. Uncheck the row → reload the page → header is gone. Re-check → header returns.
6. Add a request cookie `hm_sid` = `abc123`; visit `https://httpbin.org/cookies` → confirm `hm_sid` appears alongside any existing cookies (append, not clobber).
7. Toggle master switch Off → badge clears, reload page → no injection. On → restored.
8. Toggle theme → colors flip between light/dark; reopen popup → theme persisted.
9. Set the profile URL filter to `httpbin.org`, add a header, visit a different site → header NOT applied there; visit httpbin → applied.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: complete popup UI with profiles, tabs, rows, and reactive persistence"
```

---

## Task 8: README + manual test checklist doc

**Files:**
- Modify: `README.md`

**Interfaces:** none (documentation).

- [ ] **Step 1: Replace `README.md`**

```markdown
# HeadMod

A Manifest V3 Chrome extension to inject/modify/remove HTTP request & response
headers and cookies, with a fast Svelte popup, per-row enable/disable, and
multiple profiles.

## Develop

```bash
npm install
npm test        # unit tests (engine + state)
npm run build   # outputs dist/
```

Load `dist/` via `chrome://extensions` → Developer mode → Load unpacked.

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
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "docs: add README with dev + usage instructions"
```

---

## Self-Review Notes (addressed)

- **Spec coverage:** popup surface (Task 6–7), Svelte+Vite+TS (Task 1), request+response headers (Task 4), cookies via append (Task 4), profiles CRUD + switch (Task 3, 7), per-row enable/disable (Task 4, 7), master switch (Task 5, 7), per-profile URL filter (Task 4, 7), dark mode (Task 6, 7), `chrome.storage.local` single source of truth (Task 5, 6), one-way data flow (Task 5, 6), debounced text / immediate toggle reactivity (Task 6, 7), badge (Task 5). All covered.
- **Type consistency:** `STORAGE_KEY = 'headmod:state'` shared by worker (Task 5) and store (Task 6). `store.apply(fn, immediate)` signature consistent across Tasks 6–7. `buildRules(state)` signature consistent Tasks 4–5.
- **No placeholders:** all steps contain concrete code/commands.
```
