# What changed in this revision

Grouped by reason, not by file, so the diff is reviewable. Every change below has a
reason; nothing here is cosmetic for its own sake.

---

## Motion

**The hero rings now have something happening on them.** Previously the ellipse rings
and their dots sat completely still. The dots now travel slowly around the rings — the
left one clockwise over 58 seconds, the right one counter-clockwise over 76 — and each
ring sways a couple of degrees like a gyroscope settling. The ring geometry itself does
not move; only the satellites ride around it.

**The scroll cue became an actual scroll cue.** It was a static hairline. It is now a
vertical rail with a violet segment that falls down it, and the cue bobs a few pixels on
a deliberately out-of-phase cycle.

**Sections settle down into place instead of sliding up.** Reveals were a 15px upward
nudge. They are now a 20px downward settle, and they cover the whole page rather than
just four elements.

**The hairline in each section heading draws itself in** as the heading arrives.

**Each project diagram now animates to describe its own project.** SentryML's scan arm
sweeps the model ring. SafeOps' ellipse tumbles around the fixed policy triangle — the
agent circling the gate that constrains it. OpenMail's aliases arrive in a wave while an
unread message blinks. These start when the card scrolls into view, not on page load.

**Motion stops when it is off screen.** The orbit spin drives a custom property, so it
cannot be composited onto the GPU — running it for a whole session while the hero was
invisible was pure main-thread waste. Decorative motion now pauses with the viewport.

---

## Content

**OpenMail was described five different ways and every one of them was wrong.** It read
like a mail-server experiment. It is a free domain email creator: point it at a domain
you own, get a working inbox on it, plus unlimited aliases named however you like, all
read and sent through one proper mail interface. The card art was a generic envelope and
is now an inbox with alias chips above it. The assistant's knowledge of it was corrected
too — `api/ask.js` feeds its facts to the model, so it had been telling visitors the
wrong thing.

**"Free" is now tied to the preview.** The card claimed "Free email on a domain you
own" with nothing to say for how long that lasts, while the assistant's own facts
already said the product "is currently in preview" — so the page was making a
stronger promise than the assistant was. The card's status chip already reads
"PRODUCT PREVIEW", the same way the other two cards announce their status; the
missing piece was only the connection between the price and that preview. The
description now says "free while in preview" and the tag reads "Free in preview".
Revert by changing "free while in preview" back to "free" and "Free in preview"
back to "Free" in `index.html`.

**JEV is credited.** It routes work in SafeOps AI and appears in the project's stack
line on the card.

**Both degrees are listed.** The Bachelor of Business Administration and Computer
Application from Savitribai Phule Pune University (August 2021 – June 2023) now appears
before the Master's, and the education section is a two-row list.

**The headline reads as two lines.** `.hero-main` was capped at 910px, which made the
`h1`'s own `max-width: 1100px` unreachable, and the headline broke to "Building what" /
"matters." Widening the container restores the two-line reading. Revert by changing
`1100px` back to `910px` in `styles.css`.

---

## The assistant

**It was never talking to an AI.** The endpoint sent the Anthropic key as
`Authorization: Bearer`, but for an API key Anthropic expects `x-api-key`. Every request
would have 401'd and dropped the reply into the local guide. That is why the assistant
never seemed to be a real AI.

**It now works with any provider.** Claude, then Groq, then Gemini, tried in order and
falling through to the next if one fails. Groq and Gemini have free tiers with no card
needed. The reply is labelled with whoever answered it.

**GitHub Pages cannot run functions**, which is why `api/ask.js` has never executed on
the live site. `worker.mjs` is a Cloudflare Worker version on the free tier, so the site
can stay on GitHub Pages and still get real answers.

**The local guide is much better.** It was six first-match regexes; it is now
keyword-scored, and it answers from the same facts. This matters because on GitHub
Pages it is what every visitor actually gets.

**The assistant survives a retired model.** Groq decommissioned
`llama-3.3-70b-versatile` in September 2026 — a month after this site was built —
and the assistant went down silently, because a retired model and a bad key are
the same 502 from outside. `GROQ_MODEL` may now name several models, comma
separated; they are tried in order and one that has been retired is skipped so the
next one answers. A rejected key is still not retried, because it would fail for
every model. The list is `openai/gpt-oss-120b`, `qwen/qwen3.8-27b`,
`openai/gpt-oss-20b`. The output limit also went from 350 to 1024 tokens, so a
model that spends part of its budget reasoning cannot starve the answer.

**A provider failure is logged instead of swallowed.** When every provider failed the
Worker returned a bare 502 with no clue why, and a retired model and a bad key look
identical from the outside. That is how `llama-3.3-70b-versatile` was found to have
been decommissioned by Groq — the model stopped existing, and the Worker kept
failing silently because it threw the reason away. The reason is now written to the
Worker log, where `wrangler tail` shows it. It is still not sent to the caller: a
visitor should not learn which provider is configured, and the reply they get is
unchanged.

**The assistant answers with a real model now.** The Worker is deployed on the
Cloudflare free tier at `piyush-portfolio-assistant.piyushchavan-dev.workers.dev`,
with a Groq key set as a secret, and `site-config.js` points the page at it. On
GitHub Pages the browser now reaches the Worker instead of the local guide; the
guide remains the fallback when the Worker is unreachable or unconfigured, and it
still says which one answered. The account's `workers.dev` subdomain had to be
registered before anything could be published to it, and it is account-wide, so
every Worker sits under it.

**A missing endpoint is only asked for once.** A 404 or 503 is permanent, so the browser
stops asking and answers from the guide immediately instead of paying for a failed
request on every question.

**The wait is bounded at every layer.** The browser gives up at 15 seconds, and the
server's total budget is 14 — so it finishes before the browser gives up, and no request
is left running for a reply nobody reads.

---

## Robustness and accessibility

**The page can no longer be left blank.** The inline `has-motion` flag prevents a flash
of hidden content before first paint, but it also meant a `portfolio.js` failure would
leave everything below the hero invisible forever. The script now marks itself ready
once the reveal system is wired, and the head script drops the flag after 2.5 seconds if
that never happens. A `<noscript>` block covers JavaScript being off.

**The mobile menu works with a keyboard.** It now closes on Escape, moves focus into the
menu when it opens and returns it to the button when it closes, and does not steal focus
back when you follow a link.

**The body uses `overflow-x: clip` instead of `hidden`.** `hidden` turns the body into a
scroll container, which detaches the page from the viewport scrollport and can stop
IntersectionObserver from ever reporting a reveal target as intersecting. `clip` hides
the same overflow without creating a scroll container.

---

## Reach

**A social preview card** (`og-image.png`) so a shared link renders properly on LinkedIn
and Slack instead of as a bare URL. **`robots.txt`** and **`sitemap.xml`** are included.
Canonical and Twitter card metadata are wired up.

---

## Tooling

**`npm test`** runs 86 tests covering the local guide, the provider chain and its
fall-through, the origin allowlist, the Worker, the motion failsafe, the menu, the
motion play state, the endpoint caching, the timeout budget, and a drift guard that
stops the facts in `api/ask.js`, `worker.mjs`, `portfolio.js` and `index.html` from
disagreeing with each other.

**`push-to-github.sh` no longer drops uncommitted edits.** The script commits the git
index, so an edit made in the folder but never `git add`ed was left out of the push
without a word — and the diff the script prints before asking for confirmation did
not mention it, so the omission was invisible. It now stages the working tree before
printing the diff, which makes that diff the complete list of what will change. It
was found while setting the assistant's endpoint, where exactly that edit needed to
ship. Revert by deleting the two `git add -A` lines in `push-to-github.sh`.

**`package-lock.json` is now committed.** `npm install` had been leaving it untracked,
so the wrangler version was whatever was newest on the day. Pinning it to 4.156.0
means the Worker is deployed with the exact version this was tested against, and
installs are reproducible.

**`npm run deploy:assistant`** deploys the Worker. **`wrangler.toml`** holds its name
and non-secret settings.

**`CHANGELOG.md`** is this file.

---

## Removed

Thirteen files the page never loads — `hero.css`, `animations.css`, `about.css`,
`contact.css`, `courses.css`, `education.css`, `projects.css`, `mobile-fixes.css`,
`main.js`, `animations.js`, `scroll-animations.js`, `particles.js`, `header.css` — plus
the `piyush new website/` duplicate, the `zan/` folder and an orphaned `images/` folder
were moved to `_legacy/`, which is gitignored. They are kept on disk but are no longer
committed or deployed.

This matters because GitHub Pages publishes the whole repository: until they were moved,
`piyushchavan.com/hero.css` and `piyushchavan.com/zan/zan.html` were reachable on the
live domain.
