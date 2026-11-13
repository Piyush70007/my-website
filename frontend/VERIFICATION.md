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
