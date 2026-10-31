# Piyush Chavan — AI developer portfolio

This repository contains the source for piyushchavan.com. The redesign puts applied AI first, includes a portfolio question box, and presents SentryML, SafeOps AI, and OpenMail with their current project status.

See [CHANGELOG.md](CHANGELOG.md) for what changed in this revision and why, grouped by
reason rather than by file.

## What is ready

- Responsive editorial portfolio with keyboard-accessible navigation and reduced-motion support.
- Project links verified against the public repositories and current demos.
- Education shows both degrees: the Bachelor of Business Administration and Computer Application from Savitribai Phule Pune University (August 2021 – June 2023) and the Master’s in Software Engineering from University of Europe for Applied Sciences, completed August 2026.
- A local portfolio guide answers common questions from the published page facts. It does not send questions to a third party.
- An AI assistant endpoint is included for serverless deployment. It works with Claude, Groq or Gemini, and the provider key is read only on the server and is never shipped to the browser.
- `npm test` covers the local guide, the provider chain, the origin allowlist, the
Cloudflare Worker, the motion failsafe and the mobile menu.
- Open Graph and Twitter card metadata point at `og-image.png`, so a shared link renders a proper preview instead of a bare URL. `robots.txt` and `sitemap.xml` are included.

## Motion

The page animates on two layers.

**Decorative motion** is CSS only — the orbital rings flanking the hero, the project
diagrams, and the scroll cue. Each project diagram animates to describe its own
project: SentryML's scan arm sweeps the model ring, SafeOps' ellipse tumbles around
the fixed policy gate, OpenMail's aliases arrive in a wave while an unread message
blinks. All of it stops under `prefers-reduced-motion`.

**Scroll reveals** use an IntersectionObserver, with a `getBoundingClientRect` sweep
running alongside it. The sweep exists so a reveal target can never be left permanently
hidden — including if an ancestor becomes a scroll container, which is why `body` uses
`overflow-x: clip` rather than `hidden` (`clip` hides overflow without creating a
scroll container, and `hidden` would detach the page from the viewport scrollport).
Reduced motion unwires the scroll-driven layer explicitly, because
`animation-duration` alone does not stop a scroll-timeline animation.

Earlier stylesheets, scripts and site versions are archived in `_legacy/`. That folder
is gitignored: it stays on disk for reference but is never committed or deployed.

## GitHub Pages deployment

The existing custom domain is retained through the CNAME file. Pushing a commit to the main branch updates the static site through its existing GitHub Pages setup.

GitHub Pages cannot run the api/ask.js server function. On GitHub Pages, the question box uses its built-in portfolio guide and clearly labels those replies as guide mode. AI-generated answers require hosting that function on a serverless platform — either move the site to Vercel, or leave the site where it is and deploy the Cloudflare Worker described below.

### Publishing this revision

If you downloaded this repository as a ZIP, it has no shared history with the GitHub
repository it came from. `push-to-github.sh` bridges the two — it links this folder to
your remote, puts the work on top of the real main branch as one ordinary commit (no
force-push, history preserved), shows you exactly what the commit changes, and pushes:

    ./push-to-github.sh

It asks for your repository URL and detects whether your default branch is `main` or
`master`. If the URL is wrong, or you would rather not push, it says so and stops
without changing anything.

If you already have a clone elsewhere, copy the changed files into it instead and
commit there — the diff is 20 files and CHANGELOG.md explains each one.

## Enabling AI answers

The assistant answers questions about Piyush from a fixed set of published facts. It
calls whichever AI provider has a key configured, trying them in this order and
falling through to the next if one fails:

| Provider | Variable | Cost |
|---|---|---|
| Claude | `ANTHROPIC_API_KEY` | Paid, but new accounts get credits |
| Groq | `GROQ_API_KEY` | Free tier, no card required |
| Gemini | `GEMINI_API_KEY` | Free tier, no card required |

Two ways to host it.

**Vercel** — import this repository into a Vercel project. The function under
`api/ask.js` deploys automatically; add the provider keys as server-side Production
environment variables along with `PORTFOLIO_ALLOWED_ORIGINS`.

**Cloudflare Workers (free)** — GitHub Pages cannot run functions, so if the site
stays on GitHub Pages the browser would fall back to its built-in guide. The Worker
avoids that: it is deployed on the free tier and the site points at it.

    npm install
    npm run deploy:assistant
    npx wrangler secret put GROQ_API_KEY

The worker name and its non-secret settings live in `wrangler.toml`. The account's
`workers.dev` subdomain is `piyushchavan-dev` and must be registered once before
anything can be published to it — that subdomain is account-wide, so every Worker on
the account sits under it. `site-config.js` already points at the deployed Worker:

    window.PORTFOLIO_AI_API_URL = "https://piyush-portfolio-assistant.piyushchavan-dev.workers.dev";

Set it to `""` instead to run the local guide only, with no network request. The
local guide stays as the fallback either way: if the Worker is unreachable or has no
provider key, the assistant answers from the same facts and says so.

Do not put a provider key in site-config.js, portfolio.js, HTML, or any variable with
a public prefix. The endpoint has a short input limit, a short output limit, an
origin allowlist, a timeout, and a per-instance request throttle. The in-memory
throttle is not a global abuse or spending limit — set a spend limit with the model
provider before enabling public AI traffic.

Whichever provider answers, the reply is labelled with its name in the assistant
card. When no provider is reachable the assistant falls back to a local guide that
answers from the same facts, and says so.

The custom domain stays on GitHub Pages unless its DNS is deliberately changed later.


## Local preview

From this folder, start a static preview server:

    npm run dev

Then open http://localhost:8000. The portfolio guide works locally. The AI endpoint
requires a serverless runtime and a server-side provider key.

Run the tests with:

    npm test

## Project links

- SentryML API documentation: https://sentryml-risk-engine.onrender.com/docs
- SentryML source: https://github.com/Piyush70007/sentryml-risk-engine
- SafeOps AI source: https://github.com/Piyush70007/Safeops-ai
- OpenMail preview: https://openmail-site.vercel.app/
