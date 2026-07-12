# Chrome Web Store submission notes

Copy-paste source for the Developer Dashboard tabs. Keep in sync with the manifest.

## Description (Store listing → Description)

```
HeadMod lets you add, change, or remove HTTP request and response headers — and attach
cookies — on the sites you choose. It's a small, focused tool for debugging and testing.

I built HeadMod for myself, to debug and test things day to day, and I'm sharing it in
case it's useful to you too. It's completely free. No ads, no tracking, no analytics, no
accounts, no paid tier, and nothing is ever sent anywhere.


WHAT IT DOES

• Request headers — set a header's value, or leave the value empty to remove the header
  from outgoing requests.
• Response headers — do the same for headers coming back.
• Cookies — attach cookies to outgoing requests, or to responses.
• Profiles — keep separate sets of rules (staging, local, a specific client) and switch
  between them in one click.
• URL filter — scope a profile to matching URLs, or leave it blank to apply everywhere.
• Toggle anything — flip individual rules on and off, or switch the whole extension off
  with one shortcut. The toolbar badge shows how many rules are currently active.
• Undo / redo, light and dark themes, and keyboard shortcuts for everything you do often.


PRIVACY

HeadMod is built on Chrome's declarativeNetRequest API. That means your rules are handed
to Chrome and applied by the browser itself — the extension never intercepts, reads, or
sees the contents of your network traffic. It can't, by design.

Site access is optional and entirely yours to control. On install, HeadMod has access to
nothing. You choose: grant it every site, or grant individual sites one at a time. Rules
only ever apply where you've allowed them, and you can revoke access whenever you want.

Your rules are stored locally in your browser and never leave your device.


FEEDBACK

Suggestions, bug reports, and feature ideas are genuinely welcome — this is a tool I use
myself, so I'd like it to be good. Reach out any time.
```

## Single purpose

> HeadMod lets users define rules that add, modify, or remove HTTP request and response
> headers and cookies on the sites they have explicitly granted access to.

## Permission justifications

### `declarativeNetRequestWithHostAccess`

This is the extension's core function. HeadMod compiles the user's header and cookie rules
into declarativeNetRequest rules, which Chrome applies inside its own network stack.

This permission was chosen over `declarativeNetRequest` deliberately: it grants no implicit
access to any host, so every rule only applies to sites the user has explicitly granted.
The extension never intercepts or reads request or response content — declarativeNetRequest
modifies headers without exposing traffic to the extension.

### `storage`

Persists the user's rules, profiles, and interface preferences locally via
`chrome.storage.local`. No data is transmitted anywhere.

### `activeTab`

Reads the URL of the current tab so the popup can show which site is active and offer to
grant or revoke access for that specific site. Used only while the popup is open.

### Remote code

Select **"No, I am not using remote code."**

HeadMod executes no remote code. All logic ships inside the package. It loads no external
scripts, evaluates no strings as code, and fetches nothing at runtime. The extension makes
no network requests of its own.

### `<all_urls>` (optional host permission)

Declared as an **optional** host permission, never requested at install. Users who want
HeadMod to apply rules everywhere may grant it; users who prefer narrower access grant
individual sites instead. Header modification cannot work without host access to the target
site, so this is the minimum required for the extension's stated purpose — and it is
entirely user-controlled and revocable.

## Data use disclosures

- Does **not** collect or use personal or sensitive user data.
- Does **not** transmit any user data off the device.
- Does **not** sell or share data with third parties.
- Does **not** use data for purposes unrelated to the single purpose.
- Does **not** use data to determine creditworthiness or for lending.
- Contains **no** remote code.

## Privacy policy URL

https://gist.github.com/Lomank123/b1c1cf96d2cd00cfac9be240418f0211

Public gist of `docs/PRIVACY.md`. The listing depends on this link staying reachable — if
`docs/PRIVACY.md` changes, update the gist too.

## Store listing assets

Uploaded to the dashboard only — these are **not** part of the extension package:

| Asset | File | Notes |
| --- | --- | --- |
| Store icon (128×128) | `public/icon-128.png` | Required |
| Screenshot (1280×800) | `store-assets/screenshot-1280x800.png` | Required (at least one, up to 5) |
| Small promo tile (440×280) | `store-assets/promo-440x280.png` | Optional — RGB, no alpha |
| Marquee promo tile (1400×560) | — | Optional, not produced |

## Additional fields (Store listing)

| Field | Value | Verification |
| --- | --- | --- |
| Homepage URL | https://github.com/Lomank123/head-modifier | None needed |
| Support URL | https://github.com/Lomank123/head-modifier/issues | None needed |
| Official URL | (a domain you own) | Requires Google Search Console verification |

## Publisher settings (Settings page, not the item)

Contact email must be set **and verified** before any item can be published.

## Category and language

Developer Tools · English (United States)

## This file is not uploaded

It is a copy-paste source only. Keep it current so future updates (new permissions, new
version) do not require rewriting the justifications from scratch.
