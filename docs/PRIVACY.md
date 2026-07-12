# HeadMod — Privacy Policy

_Last updated: 12 July 2026_

## Summary

HeadMod does not collect, transmit, sell, or share any user data. Everything the
extension stores stays on your own device.

## What HeadMod stores

HeadMod saves the configuration you create in the extension popup:

- Header rules (name, value, request/response target, enabled state)
- Cookie rules (name, value, request/response target, enabled state)
- Profiles (profile name and URL filter)
- Interface preferences (active profile, global on/off state, theme)

This data is stored locally on your device using the browser's `chrome.storage.local`
API. It never leaves your browser.

## What HeadMod does not do

- It does not collect personal or sensitive information.
- It does not read, capture, or log the content of your network requests or responses.
- It does not transmit any data to the developer or to any third party.
- It contains no analytics, telemetry, tracking, or advertising.
- It loads no remote code.

## How header modification works

HeadMod uses Chrome's `declarativeNetRequest` API. Rules you define are handed to the
browser, and the browser applies them inside its own network stack. The extension does
not intercept, inspect, or receive the contents of your network traffic — it only tells
Chrome, in advance, which headers to change.

## Site access

HeadMod requests host access only as an optional permission. Header and cookie rules are
applied exclusively to sites you have explicitly granted access to — either by granting
access to all sites, or by granting access to individual sites you choose. You can review
or revoke this access at any time from Chrome's extension settings.

## Data retention and deletion

Your configuration remains on your device until you delete it. Removing the extension from
Chrome deletes all data it stored.

## Changes to this policy

Any changes to this policy will be published on this page with an updated date.

## Contact

For questions about this policy, contact: lomank200222@gmail.com
