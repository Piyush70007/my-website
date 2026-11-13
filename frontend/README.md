# Piyush's React portfolio preview

A component-based React + Vite rebuild of the public portfolio, with Motion for scroll reveals and transitions. This is the React source for the GitHub Pages site. The root publication is generated with `npm run build` from the repository root. The existing Cloudflare Worker powers AI answers on the two public portfolio origins.

The motion update adds replaying scroll entrances, cursor-responsive project frames, and a guided tour through the real OpenMail interface. SentryML and SafeOps use explicitly labeled animated examples. Each example can be paused; the floating Motion control pauses the whole page. Timed scenes stop offscreen and in background tabs, and respect the system's reduced-motion setting.

The hero shows the Hyper3D Rodin bust selected by Piyush on 13 November 2026, with a black shirt and jacket, cropped below the chest. The optimized local GLB is approximately 3.17 MB. `AvatarBust.jsx` loads it with Meshopt compression and provides slow 360-degree rotation, pointer dragging, keyboard rotation, pause and front controls. Motion stops offscreen and respects reduced-motion settings. The approved 2D portrait remains the loading and WebGL fallback. Visitors do not contact Hyper3D. See `AVATAR_SOURCES.md` for provenance.

## Run

```sh
cd frontend
npm ci
npm run dev
```

Open http://127.0.0.1:5174/. Build with `npm run build`; verify the production output with `npm run preview`. Run focused behavior checks with `npm test`.

## What is connected

- The hero's assistant uses published facts locally. On the two existing production portfolio origins, it uses the existing assistant endpoint with a 16-second timeout and a clearly labeled factual fallback. No API keys are in this app. Its public knowledge includes all four featured projects and the supplied education dates.
- OpenMail uses the actual mailbox frontend, embedded in an iframe with `allow-scripts` only. Every API request is intercepted by a sample transport, and CSP denies all network connections and form submissions. No sending, saving, AI generation, uploads, or real login occurs. All displayed data and metrics are fictional and labeled. The full-screen explorer allows navigation through the real interface.
- SentryML links to its real API documentation; SafeOps is labeled in development.
- The CV is intentionally unset in `src/content.js`. Until Piyush supplies a public PDF, the button opens a request email. Do not copy a private CV from Downloads.
- Fonts and official university logos are served locally. There are no analytics or tracking scripts.

## Main files

- `src/App.jsx`: page composition, projects, education, CV, contact.
- `src/Assistant.jsx` and `src/content.js`: public facts and assistant integration.
- `src/AvatarBust.jsx` and `src/avatarAsset.js`: portrait and optional 3D model viewer.
- `src/style.css`: responsive visual system.
- `public/openmail/`: isolated snapshot of the actual OpenMail UI.
- `ASSET_SOURCES.md`: source URLs and attribution.

## Publishing

From the repository root, run `npm ci` and `npm --prefix frontend ci`, then `npm test` and `npm run build`. The build script copies only the generated public files into the root, preserving the existing GitHub Pages main/root setup and CNAME. `published-files.json` tracks generated files so later builds can remove obsolete bundles. Commit the source and prepared output together, and push main without force.

The existing Cloudflare Worker is deployed separately with `npm run deploy:assistant`. Its provider keys remain in server secrets. Local previews use the published-facts guide; the real model is called only on the two allowed production origins.

The Mivvy card flips between the current desktop-browser and phone web screenshots. It respects motion settings, supports keyboard-operated controls, and hides the reverse face from assistive technology. Replace the front asset and its labels together when Piyush supplies an approved screenshot of the Windows application. The current front image must not be described as the executable.

The original public site is retained in the remote backup branch `backup/portfolio-before-studio-redesign-20261111`. The public CV remains unset until Piyush supplies it.

The source snapshot can be refreshed with `python3 scripts/sync-openmail-preview.py /absolute/path/to/openmail-site`; update its recorded commit if the upstream revision changes. It copies an explicit allowlist, never environment files or account data.
