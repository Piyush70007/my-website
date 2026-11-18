# Piyush Chavan’s portfolio

React, Vite, Motion and Three.js power the portfolio at https://piyushchavan.com. The source lives in `frontend/`. GitHub Pages serves the prepared root files; the existing Cloudflare Worker supplies AI answers with server-only Groq credentials.

The portfolio includes a rotating Hyper3D bust, a factual AI guide, four projects, education, and a CV request section. OpenMail embeds its actual interface behind an isolated fictional sample transport. Mivvy’s card includes a real Windows EXE capture alongside the desktop-browser and phone web screenshots. SentryML links to its real API docs, and SafeOps is labeled in development. The CV PDF is not published.

## Develop and verify

```sh
npm ci
npm --prefix frontend ci
npm run dev
```

Open http://127.0.0.1:5174/. Local previews use the built-in portfolio guide; model calls run only on the production portfolio origins.

```sh
npm test
npm run build
```

Tests cover the AI provider flow, origin and input boundaries, request throttling, current knowledge, local fallback, and the OpenMail sample’s network and mutation boundaries. The production build prepares the GitHub Pages root and records its public files in `published-files.json`. Source images and exported assets are served locally without visitor calls to a generation service. No analytics or tracking scripts are included.

## Publish

Commit the React source and prepared root output together, then push `main`. The existing GitHub Pages main/root configuration publishes the site without changing DNS. Keep CNAME set to `piyushchavan.com`. `.nojekyll` bypasses Jekyll. Older generated bundles are removed by the build script only when listed in its previous manifest.

The remote branch `backup/portfolio-before-studio-redesign-20261111` preserves the old public website. The branch `chatgpt-webbackup` preserves the site as it was before the 17 November 2026 ember redesign. Roll back by restoring its root files and pushing a normal commit, or revert the release commit; do not force-push history.

## Portfolio AI

```sh
npm run deploy:assistant
```

The Worker at https://piyush-portfolio-assistant.piyushchavan-dev.workers.dev answers questions using the public portfolio facts. Groq is the current configured provider. Keys remain in Worker secrets, never in public files. Optional provider support is also retained in `api/ask.js` for Vercel deployments, with identical facts.

The React interface waits up to 16 seconds, labels model answers with their provider, and falls back to local published facts when unavailable. Questions are sent only after a visitor submits them, with a privacy notice beside the form; no conversation history is persisted by this app. Third-party processing follows the AI provider’s policy. The Worker has exact-origin CORS, 400-character input limits, timeouts, and a per-isolate throttle. This throttle is approximate across distributed isolates, not a global spend guarantee.

## Sources and deferred assets

See `frontend/ASSET_SOURCES.md`, `frontend/AVATAR_SOURCES.md`, and `frontend/README.md` for asset provenance and interface details. Original user photos, private credentials, downloads, and local review output are excluded from publication. The generated bust and approved web screenshots are the only personal visual assets included for this redesign.
