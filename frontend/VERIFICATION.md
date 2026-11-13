# Portfolio release verification — 13 November 2026

## Automated checks

The production build passes. Six backend tests cover current model context, rejected origins and input, throttling, model fallback, server parity, and timeout alignment. Ten frontend checks cover education, project matching, unknown facts, production-origin routing, the isolated sample mailbox, mutation refusal, and tour message boundaries.

## Browser review

- The selected Hyper3D GLB loads with Meshopt decoding. Autorotation, pause, front reset, keyboard rotation, and global motion pause were checked. Phone fit was reviewed without horizontal overflow.
- Mivvy flips between the actual desktop-browser and phone web screenshots using buttons or the keyboard. A narrow-screen stage-width issue was found and fixed; the final stage fits inside its card. The inactive face is hidden from assistive technology. Global pause and reduced-motion styles remove the flip transition.
- The OpenMail tour uses the actual interface with fictional mail and metrics. Its sample transport and iframe policy prevent sending, saving, uploads, and real model calls.
- The education section keeps both degrees and the August 2026 completion date. No CV PDF is represented as available.

## Live AI checks

The existing Cloudflare Worker was updated without changing its secrets or allowed production origins. Four requests returned Groq answers successfully: Mivvy and its three identities, the master's completion date, domain verification and provider limits for OpenMail, and a refusal to invent a phone number or salary. Observed response times were 308–880 ms in this small sample; these are verification results, not performance guarantees.

The browser's local-origin guide is intentionally separate from model answers. Final production-origin browser verification is performed after GitHub Pages publishes the release.

## Limits

The Windows Mivvy executable was not run on this Mac. Its front preview remains a desktop-browser capture until the user provides a Windows screenshot. Native Safari compatibility and an external penetration test were not part of this release. The CV PDF remains deferred. Provider quotas and distributed per-isolate throttling still apply.

## Mobile interaction regression review

Fixed a reveal feedback loop at the viewport boundary: the same moving element had been observed repeatedly, allowing its transform to cross its own threshold. Entrances now latch after first entry; phone reveals keep controls stationary. The CTA's document position remained 428.5078125px while scrolling through and beyond its former boundary, with no resetting transform.

The OpenMail explorer now renders directly under body, outside animated wrappers. Its X has a 44×44px hit area. Tested opening and closing repeatedly, closing after iframe search/category interaction, Escape from the parent and the frame, removed iframe content after close, restored focus, released scroll lock, and preserved the exact background scroll position. Reviewed 320×740, 390×844, 390×650 and 1440×1000 layouts. No horizontal page overflow was observed.

The broader visitor review covered mobile menu and work navigation, Mivvy flipping, SentryML mouse/keyboard tabs and animation reaching its result, SafeOps reaching its blocked-action result, OpenMail manual tour navigation reaching Results, 3D pause/front/keyboard controls, global motion pause, local AI education answer and dismissal, university image loading, and the honest CV mailto link. All eight external product/source/university links returned HTTP 200. No application console errors were observed.

Automated total: 17 passing tests (6 backend and 11 frontend), including the new sandboxed Escape/inner-overlay regression. These viewport checks do not replace testing on every physical phone or browser.
