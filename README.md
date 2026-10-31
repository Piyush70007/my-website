# Piyush Chavan — AI developer portfolio

This repository contains the source for piyushchavan.com. The redesign puts applied AI first, includes a portfolio question box, and presents SentryML, SafeOps AI, and OpenMail with their current project status.

## What is ready

- Responsive editorial portfolio with keyboard-accessible navigation and reduced-motion support.
- Project links verified against the public repositories and current demos.
- Education updated to show the Master’s in Software Engineering at University of Europe for Applied Sciences as completed in August 2026.
- A local portfolio guide answers common questions from the published page facts. It does not send questions to a third party.
- A Claude Messages API endpoint is included for a future serverless deployment. Its API key is read only on the server and is never shipped to the browser.

## GitHub Pages deployment

The existing custom domain is retained through the CNAME file. Pushing a commit to the main branch updates the static site through its existing GitHub Pages setup.

GitHub Pages cannot run the api/ask.js server function. On GitHub Pages, the question box uses its built-in portfolio guide and clearly labels those replies as guide mode. Claude-generated answers require hosting that function on a serverless platform.

## Enabling Claude answers

Import this repository into a Vercel project to deploy the static site and the function under api/ask.js. Add these server-side Production environment variables in Vercel:

    ANTHROPIC_API_KEY       A key created in the Claude Console
    ANTHROPIC_MODEL         claude-haiku-4-5-20251001 (optional override)
    PORTFOLIO_ALLOWED_ORIGINS  https://piyushchavan.com,https://www.piyushchavan.com

Do not put the API key in site-config.js, portfolio.js, HTML, or any variable with a public prefix. The endpoint has a short input limit, a short output limit, an origin allowlist, a timeout, and a per-instance request throttle. The in-memory throttle is not a global abuse or spending limit. Set an account spend limit with the model provider before enabling public AI traffic.

When the endpoint is hosted on a separate Vercel URL while the website remains on GitHub Pages, update site-config.js to point PORTFOLIO_AI_API_URL at that endpoint. The server must allow the exact portfolio origin in PORTFOLIO_ALLOWED_ORIGINS. The current custom domain stays on GitHub Pages unless its DNS is deliberately changed later.

## Local preview

From this folder, start a static preview server:

    python3 -m http.server 8000

Then open http://localhost:8000. The portfolio guide works locally. The Claude function requires a serverless runtime and a server-side API key.

## Project links

- SentryML API documentation: https://sentryml-risk-engine.onrender.com/docs
- SentryML source: https://github.com/Piyush70007/sentryml-risk-engine
- SafeOps AI source: https://github.com/Piyush70007/Safeops-ai
- OpenMail preview: https://openmail-site.vercel.app/
