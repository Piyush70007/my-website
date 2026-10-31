// Where the assistant endpoint lives.
//
//   "/api/ask"        works when the site is deployed to Vercel, where
//                     api/ask.js runs as a serverless function next to the
//                     static site.
//
//   a Workers URL     use this when the site stays on GitHub Pages, which
//                     cannot run functions at all. Deploy worker.mjs with
//                     `npm run deploy:assistant`.
//
//   ""                no endpoint. The assistant answers from its built-in
//                     guide only, with no network request.
//
// The Worker reads its provider key from a secret and answers with a real model.
// Its origin allowlist covers piyushchavan.com and www.piyushchavan.com.
window.PORTFOLIO_AI_API_URL = "https://piyush-portfolio-assistant.piyushchavan-dev.workers.dev";
