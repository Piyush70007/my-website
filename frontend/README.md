# Piyush's React portfolio preview

A component-based React + Vite rebuild of the public portfolio, with Motion for scroll reveals and transitions. This is the React source for the GitHub Pages site. The root publication is generated with `npm run build` from the repository root. The existing Cloudflare Worker powers AI answers on the two public portfolio origins.

The motion update adds one-time scroll entrances, cursor-responsive project frames, and a guided tour through the real OpenMail interface. SentryML and SafeOps use explicitly labeled animated examples. Each example can be paused; the floating Motion control pauses the whole page. Timed scenes stop offscreen and in background tabs, and respect the system's reduced-motion setting.

The hero shows the Hyper3D Rodin bust selected by Piyush on 13 November 2026, with a black shirt and jacket, cropped below the chest. The optimized local GLB is approximately 3.17 MB. `AvatarBust.jsx` loads it with Meshopt compression and provides slow 360-degree rotation, pointer dragging, keyboard rotation, pause and front controls. Motion stops offscreen and respects reduced-motion settings. The loading area is reserved for the 3D view; no photo or raster fallback is rendered. An unavailable device receives a short text status. Visitors do not contact Hyper3D. See `AVATAR_SOURCES.md` for provenance.

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

The Mivvy card flips between Windows EXE, desktop-browser and phone web previews. Each view has its own keyed animated face, including Windows-to-desktop switches. `MivvyExePreview.jsx` recreates the Windows layout as a responsive local UI demo: a Canvas 2D globe, identity selection, sample messages with cancellation, illustrative tools and a simulated listening state. It never requests microphone permission, calls an AI provider, saves tasks or operates the visitor's computer. The full-size link remains an approved screenshot of the real EXE.

The globe is capped at 24 fps, or 12 fps with 92 points in Low power mode. It stops when off-screen, when the document is hidden, when its preview face unmounts, or when motion is paused/reduced. Identity and chat state remain local and are reset when the preview unmounts. Desktop-browser and phone images show the web application; they are not native iOS captures.

The original public site is retained in the remote backup branch `backup/portfolio-before-studio-redesign-20261111`. The public CV remains unset until Piyush supplies it.

The source snapshot can be refreshed with `python3 scripts/sync-openmail-preview.py /absolute/path/to/openmail-site`; update its recorded commit if the upstream revision changes. It copies an explicit allowlist, never environment files or account data.

## Mobile interaction fixes

Scroll entrances stay visible after their first reveal. Phone sections fade without moving their touch targets. The OpenMail explorer is portaled outside reveal transforms, locks background scrolling while open, and has a 44px close button. Closing restores the trigger focus without scrolling. Escape from the sandboxed preview uses a source-checked dismissal message, while inner menus and compose dialogs retain their own Escape behavior.
