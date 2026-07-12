# Chrome Web Store submission notes

Copy-paste source for the Developer Dashboard tabs. Keep in sync with the manifest.

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

Host `docs/PRIVACY.md` publicly (GitHub Pages, a gist, or any static host) and paste the
resulting URL into the Privacy tab.

## Store listing assets

Uploaded to the dashboard only — these are **not** part of the extension package:

| Asset | File | Notes |
| --- | --- | --- |
| Store icon (128×128) | `store-assets/icon-128.png` | Required |
| Screenshot (1280×800 or 640×400) | `store-assets/popup@2x.png` | Required — verify dimensions match one of the two accepted sizes |
| Small promo tile (440×280) | `store-assets/promo-440x280.png` | Optional |
