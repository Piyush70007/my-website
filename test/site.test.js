/**
 * Site tests.
 *
 *   npm test
 *
 * Covers the things that are easy to break and hard to notice:
 *   1. the local guide in portfolio.js — what answers when no AI endpoint is
 *      reachable, which on GitHub Pages is every visitor
 *   2. the provider chain in api/ask.js — the order providers are tried in,
 *      what happens when one fails, and that the origin allowlist holds
 *   3. the Cloudflare Worker, which is the other hosting path
 *   4. the motion failsafe — a page must never be left blank because a script
 *      failed to load
 *   5. the mobile menu — Escape closes it, and focus moves sensibly
 *
 * The DOM is stubbed and fetch is replaced, so nothing here touches the
 * network or needs a browser.
 */

"use strict";

const fs = require("fs");
const vm = require("vm");
const path = require("path");

const ROOT = path.join(__dirname, "..");
let passed = 0;
let failed = 0;

function check(name, condition, detail) {
  if (condition) {
    passed++;
    console.log("  PASS  " + name);
  } else {
    failed++;
    console.log("  FAIL  " + name + (detail ? "\n          " + detail : ""));
  }
}

/* ── a DOM small enough to run the real site scripts ────────────────────── */

function makeElement(tag) {
  const element = {
    tagName: tag,
    children: [],
    listeners: {},
    className: "",
    hidden: false,
    disabled: false,
    value: "",
    dataset: {},
    style: {},
    classes: new Set(),
    focused: false,
    rect: { top: 0, bottom: 100, left: 0, right: 100, width: 100, height: 100 },
    getBoundingClientRect() { return this.rect; },
    classList: {
      add(...names) { names.forEach((n) => element.classes.add(n)); },
      remove(...names) { names.forEach((n) => element.classes.delete(n)); },
      toggle(name, force) {
        const on = force === undefined ? !element.classes.has(name) : !!force;
        if (on) element.classes.add(name);
        else element.classes.delete(name);
        return on;
      },
      contains(name) { return element.classes.has(name); }
    },
    addEventListener(type, handler) {
      (this.listeners[type] = this.listeners[type] || []).push(handler);
    },
    dispatch(type, event) {
      (this.listeners[type] || []).forEach((handler) => handler(event || { preventDefault() {} }));
    },
    replaceChildren() { this.children = []; },
    append(...nodes) { this.children.push(...nodes); },
    scrollIntoView() {},
    focus() { element.focused = true; sandbox.document.activeElement = element; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    get textContent() {
      return this.children.length
        ? this.children.map((child) => child.textContent).join(" | ")
        : this._text || "";
    },
    set textContent(value) { this._text = value; this.children = []; }
  };
  return element;
}

const sandbox = {};

function buildDom(options) {
  const settings = options || {};
  const elements = {
    "assistant-form": makeElement("form"),
    "assistant-question": makeElement("input"),
    "assistant-answer": makeElement("div"),
    "assistant-status-text": makeElement("span")
  };
  elements["assistant-form"].querySelector = (selector) =>
    selector === "button[type='submit']" ? makeElement("button") : null;

  const menuToggle = makeElement("button");
  menuToggle.setAttribute = (key, value) => { menuToggle[key] = value; };
  menuToggle.getAttribute = (key) => menuToggle[key];
  menuToggle.setAttribute("aria-expanded", "false");

  const navLink = makeElement("a");
  const nav = makeElement("nav");
  nav.querySelectorAll = (selector) => (selector === "a" ? [navLink] : []);
  nav.querySelector = (selector) => (selector === "a" ? navLink : null);
  nav.classList.add("site-nav");

  const documentElement = { classes: new Set() };
  documentElement.classList = {
    add(name) { documentElement.classes.add(name); },
    remove(name) { documentElement.classes.delete(name); },
    contains(name) { return documentElement.classes.has(name); }
  };

  const motionGroup = makeElement("section");
  motionGroup.rect = { top: 0, bottom: 600, left: 0, right: 1000, width: 1000, height: 600 };

  const documentStub = {
    body: makeElement("body"),
    documentElement,
    createElement: (tag) => makeElement(tag),
    activeElement: null,
    listeners: {},
    getElementById: (id) => elements[id] || null,
    querySelector: (selector) => {
      if (selector === ".menu-toggle") return menuToggle;
      if (selector === ".site-nav") return nav;
      return null;
    },
    querySelectorAll: (selector) => {
      if (selector === "[data-motion]") return [motionGroup];
      return [];
    },
    addEventListener(type, handler) {
      (this.listeners[type] = this.listeners[type] || []).push(handler);
    },
    dispatch(type, event) {
      (this.listeners[type] || []).forEach((handler) => handler(event));
    }
  };
  documentStub.body.setAttribute = () => {};
  documentStub.body.getAttribute = () => "false";

  const windowStub = {
    innerHeight: 800,
    innerWidth: 1280,
    matchMedia: () => ({ matches: false }),
    listeners: {},
    addEventListener(type, handler) {
      (this.listeners[type] = this.listeners[type] || []).push(handler);
    },
    dispatch(type, event) {
      (this.listeners[type] || []).forEach((handler) => handler(event));
    },
    requestAnimationFrame(callback) { callback(0); },
    scrollTo() {},
    document: documentStub
  };

  sandbox.document = documentStub;
  sandbox.window = windowStub;
  sandbox.console = console;
  sandbox.fetch = settings.fetch || (() => Promise.reject(new Error("no endpoint configured")));

  return { elements, menuToggle, nav, navLink, motionGroup, documentStub, windowStub };
}

function runPortfolio(dom) {
  vm.runInNewContext(
    fs.readFileSync(path.join(ROOT, "portfolio.js"), "utf8"),
    {
      document: dom.documentStub,
      window: dom.windowStub,
      fetch: sandbox.fetch,
      console,
      // A fresh vm context has only JS built-ins. These are Web/host APIs the
      // browser provides, and the assistant uses them for its request timeout.
      AbortController,
      setTimeout,
      clearTimeout
    },
    { filename: "portfolio.js" }
  );
}

/* ── 1. the local guide ─────────────────────────────────────────────────── */

const GUIDE_CASES = [
  ["What did SafeOps AI prove?", "JEV routes the work"],
  ["How do the aliases work?", "free domain email creator"],
  ["What is SentryML?", "churn"],
  ["Where did he study?", "Savitribai Phule Pune University"],
  ["What did he study?", "Savitribai Phule Pune University"],
  ["Does he have a BBA?", "Bachelor of Business Administration"],
  ["Is he a graduate?", "University of Europe for Applied Sciences"],
  ["How can I reach him?", "chavanpiyush100@gmail.com"],
  ["Who is Piyush?", "AI-focused developer in Berlin"],
  ["What projects has he built?", "Three projects"],
  ["zxq unrelated gibberish 42", "I can help with Piyush's three projects"]
];

async function testGuide() {
  console.log("\nLocal guide (portfolio.js)");
  const dom = buildDom();
  runPortfolio(dom);
  for (const [question, expected] of GUIDE_CASES) {
    dom.elements["assistant-question"].value = question;
    dom.elements["assistant-form"].dispatch("submit", { preventDefault() {} });
    await new Promise((resolve) => setTimeout(resolve, 15));
    const out = dom.elements["assistant-answer"].textContent;
    check(
      JSON.stringify(question),
      out.indexOf(expected) !== -1,
      "expected to contain: " + expected + "\n          got: " + out.slice(0, 160)
    );
  }
  const sample = await (async () => {
    dom.elements["assistant-question"].value = "What is SentryML?";
    dom.elements["assistant-form"].dispatch("submit", { preventDefault() {} });
    await new Promise((resolve) => setTimeout(resolve, 15));
    return dom.elements["assistant-answer"];
  })();
  check("labels itself as the guide", sample.textContent.split(" | ")[0].indexOf("Portfolio guide") !== -1);
  check("status shows GUIDE MODE", dom.elements["assistant-status-text"].textContent === "GUIDE MODE");
}

/* ── 2. the provider chain ──────────────────────────────────────────────── */

function makeResponse() {
  return {
    _status: 0,
    _body: null,
    headers: {},
    setHeader(key, value) { this.headers[key] = value; },
    status(code) { this._status = code; return this; },
    json(body) { this._body = body; return this; },
    end() { return this; }
  };
}

async function testProviders() {
  console.log("\nProvider chain (api/ask.js)");
  const ask = require(path.join(ROOT, "api/ask.js"));
  const originalFetch = global.fetch;
  const originalEnv = {};
  const log = [];

  const groqBody = { choices: [{ message: { content: "Answer from Groq." } }] };
  const geminiBody = {
    candidates: [
      { content: { parts: [{ text: "Answer from Gemini." }] } }
    ]
  };

  global.fetch = async (url) => {
    log.push(url.split("/")[2]);
    if (url.indexOf("groq") !== -1) return { ok: true, status: 200, json: async () => groqBody };
    if (url.indexOf("generativelanguage") !== -1) return { ok: true, status: 200, json: async () => geminiBody };
    return { ok: false, status: 401, json: async () => ({}) };
  };

  async function call(env, question, origin) {
    log.length = 0;
    Object.keys(env).forEach((key) => { originalEnv[key] = process.env[key]; process.env[key] = env[key]; });
    const response = makeResponse();
    await ask(
      { method: "POST", headers: { origin: origin || "https://piyushchavan.com" }, body: { question } },
      response
    );
    Object.keys(env).forEach((key) => {
      if (originalEnv[key] === undefined) delete process.env[key];
      else process.env[key] = originalEnv[key];
    });
    return { response, tried: log.slice() };
  }

  const onlyGemini = await call({ GEMINI_API_KEY: "k" }, "what is safeops");
  check("Gemini-only answers from Gemini", onlyGemini.response._body.source === "gemini", JSON.stringify(onlyGemini.response._body));
  check("response carries the provider name", onlyGemini.response._body.provider === "Gemini");

  const onlyGroq = await call({ GROQ_API_KEY: "k" }, "what is safeops");
  check("Groq-only answers from Groq", onlyGroq.response._body.source === "groq");

  const fallsThrough = await call({ ANTHROPIC_API_KEY: "k", GROQ_API_KEY: "g" }, "what is safeops");
  check(
    "a failing provider falls through to the next",
    fallsThrough.tried.join(",") === "api.anthropic.com,api.groq.com",
    "tried: " + fallsThrough.tried.join(",")
  );
  check("and the next provider answers", fallsThrough.response._body.source === "groq");

  const noKeys = await call({}, "what is safeops");
  check("no keys returns 503", noKeys.response._status === 503);
  check("and the error names a free option", /GROQ_API_KEY|GEMINI_API_KEY/.test(noKeys.response._body.error));

  const blocked = await call({ GROQ_API_KEY: "k" }, "x", "https://not-the-portfolio.example");
  check("a disallowed origin is refused", blocked.response._status === 403);

  const tooLong = await call({ GROQ_API_KEY: "k" }, "x".repeat(500));
  check("an over-long question is rejected", tooLong.response._status === 400);

  global.fetch = originalFetch;
}

/* ── 3. the Cloudflare Worker ───────────────────────────────────────────── */

async function testWorker() {
  console.log("\nCloudflare Worker (worker.mjs)");
  let worker;
  try {
    worker = (await import(path.join(ROOT, "worker.mjs"))).default;
  } catch (error) {
    check("worker.js loads as an ES module", false, error.message);
    return;
  }
  check("worker.js exports a fetch handler", typeof worker.fetch === "function");

  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    if (url.indexOf("groq") !== -1) return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: "Worker answer." } }] }) };
    return { ok: false, status: 401, json: async () => ({}) };
  };

  const env = { GROQ_API_KEY: "k", PORTFOLIO_ALLOWED_ORIGINS: "https://piyushchavan.com" };
  // Two named models, so the tests below can tell one apart from the other.
  const twoModelEnv = Object.assign({}, env, { GROQ_MODEL: "model-one,model-two" });
  const request = new Request("https://worker.example", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://piyushchavan.com" },
    body: JSON.stringify({ question: "what is safeops" })
  });
  const result = await worker.fetch(request, env);
  const body = await result.json();
  check("worker answers from a configured provider", result.status === 200 && body.source === "groq", JSON.stringify(body));

  const blockedRequest = new Request("https://worker.example", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://not-the-portfolio.example" },
    body: JSON.stringify({ question: "x" })
  });
  const blocked = await worker.fetch(blockedRequest, env);
  check("worker refuses a disallowed origin", blocked.status === 403);

  // A provider that fails must not leak the reason to the caller, but it has
  // to be logged. Otherwise a retired model and a bad key are the same silent
  // 502, and there is no way to tell them apart in production.
  const logged = [];
  const originalError = console.error;
  console.error = (...args) => { logged.push(args.join(" ")); };
  global.fetch = async () => ({ ok: false, status: 400, json: async () => ({}) });
  const failing = await worker.fetch(new Request("https://worker.example", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://piyushchavan.com" },
    body: JSON.stringify({ question: "what is safeops" })
  }), twoModelEnv);
  const failingBody = await failing.json();
  console.error = originalError;
  check("a failed provider gives a generic error", failing.status === 502 && JSON.stringify(failingBody).indexOf("400") === -1, JSON.stringify(failingBody));
  check("the reason is logged rather than returned", logged.join(" ").indexOf("groq") !== -1, logged.join(" | "));
  check("the log names the status and the model", logged.join(" ").indexOf("400") !== -1 && logged.join(" ").indexOf("model-one") !== -1, logged.join(" | "));

  // Groq retires models without warning, so a model that has gone must fall
  // through to the next one rather than taking the assistant down.
  const attempted = [];
  global.fetch = async (url, options) => {
    attempted.push(JSON.parse(options.body).model);
    if (attempted.length === 1) return { ok: false, status: 400, json: async () => ({}) };
    return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: "Second model answered." } }] }) };
  };
  const fell = await worker.fetch(new Request("https://worker.example", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://piyushchavan.com" },
    body: JSON.stringify({ question: "what is safeops" })
  }), twoModelEnv);
  const fellBody = await fell.json();
  check("a retired model falls through to the next", fell.status === 200 && fellBody.answer === "Second model answered.", JSON.stringify(fellBody));
  check("the retired model is tried first", attempted.join(",") === "model-one,model-two", attempted.join(","));

  // A rejected key will fail for every model, so it must not be retried.
  const keyAttempts = [];
  global.fetch = async (url, options) => {
    keyAttempts.push(JSON.parse(options.body).model);
    return { ok: false, status: 401, json: async () => ({}) };
  };
  const rejected = await worker.fetch(new Request("https://worker.example", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://piyushchavan.com" },
    body: JSON.stringify({ question: "what is safeops" })
  }), twoModelEnv);
  check("a rejected key is not retried on another model", rejected.status === 502 && keyAttempts.length === 1, "attempts: " + keyAttempts.join(","));

  global.fetch = originalFetch;
}

/* ── 4. the motion failsafe ─────────────────────────────────────────────── */

function testMotionFailsafe() {
  console.log("\nMotion failsafe (index.html)");
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const inline = html.match(/<script>([\s\S]*?)<\/script>/);
  check("index.html has an inline motion script", !!inline);
  if (!inline) return;

  // Run the head script with a fake documentElement and a captured timer.
  const classes = new Set();
  const documentElement = {
    classes,
    classList: {
      add(name) { classes.add(name); },
      remove(name) { classes.delete(name); },
      contains(name) { return classes.has(name); }
    }
  };
  let timerCallback = null;
  const context = {
    document: { documentElement },
    setTimeout(callback) { timerCallback = callback; }
  };
  vm.runInNewContext(inline[1], context);

  check("the flag is set before first paint", classes.has("has-motion"), [...classes].join(","));
  check("a failsafe timer is armed", typeof timerCallback === "function");

  // portfolio.js booted
  documentElement.classList.add("motion-ready");
  timerCallback();
  check("the flag survives when portfolio.js booted", classes.has("has-motion"), [...classes].join(","));

  // portfolio.js never booted
  documentElement.classList.remove("motion-ready");
  timerCallback();
  check("the flag is dropped when portfolio.js did not boot", !classes.has("has-motion"), [...classes].join(","));

  check("there is a noscript fallback", html.indexOf("<noscript>") !== -1);
}

/* ── 5. the mobile menu ─────────────────────────────────────────────────── */

function testMenu() {
  console.log("\nMobile menu (portfolio.js)");
  const dom = buildDom();
  runPortfolio(dom);

  dom.menuToggle.dispatch("click");
  check("clicking the toggle opens the menu", dom.menuToggle["aria-expanded"] === "true");
  check("the menu gets the open class", dom.nav.classList.contains("is-open"));
  check("the button is relabelled", dom.menuToggle["aria-label"] === "Close navigation");
  check("focus moves into the menu", dom.navLink.focused === true);

  dom.documentStub.dispatch("keydown", { key: "Escape" });
  check("Escape closes the menu", dom.menuToggle["aria-expanded"] === "false");
  check("the open class is removed", !dom.nav.classList.contains("is-open"));
  check("focus returns to the button", dom.menuToggle.focused === true);

  dom.navLink.dispatch("click");
  check("following a link closes the menu", dom.menuToggle["aria-expanded"] === "false");
}

/* ── 6. motion only runs on screen ──────────────────────────────────────── */

function testMotionPlayState() {
  console.log("\nMotion play state (portfolio.js)");
  const dom = buildDom();
  runPortfolio(dom);

  check("a group in view is marked in-view", dom.motionGroup.classList.contains("is-inview"));

  // Scroll it well off screen and fire a scroll event.
  dom.motionGroup.rect = { top: -2000, bottom: -1000, left: 0, right: 1000, width: 1000, height: 1000 };
  dom.windowStub.dispatch("scroll", {});
  check("a group scrolled off screen stops being in-view", !dom.motionGroup.classList.contains("is-inview"));

  // Bring it back.
  dom.motionGroup.rect = { top: 10, bottom: 600, left: 0, right: 1000, width: 1000, height: 590 };
  dom.windowStub.dispatch("scroll", {});
  check("and resumes when it comes back", dom.motionGroup.classList.contains("is-inview"));

  const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
  check("the css pauses motion by default", css.indexOf("--motion-play: paused") !== -1);
  check("and resumes it for in-view groups", css.indexOf("--motion-play: running") !== -1);
  check("every infinite animation respects the flag", (css.match(/animation-play-state: var\(--motion-play\)/g) || []).length >= 12);
}

/* ── 7. the facts do not drift apart ────────────────────────────────────── */

function extractFacts(source) {
  const match = source.match(/const PORTFOLIO_FACTS = \[([\s\S]*?)\]\.join\("\\n"\);/);
  return match ? match[1] : "";
}

// Every one of these has to be true in all three places it is written down,
// or the assistant will start contradicting the page.
const CANONICAL_FACTS = [
  "Savitribai Phule Pune University",
  "August 2021",
  "June 2023",
  "University of Europe for Applied Sciences",
  "August 2026",
  "JEV",
  "free domain email creator",
  "chavanpiyush100@gmail.com",
  "3 October 2026",
  "XGBoost",
  "Open Policy Agent",
  "Argo Rollouts"
];

// Facts the published page states in its own words.
const PAGE_FACTS = [
  "Savitribai Phule Pune University",
  "August 2021",
  "June 2023",
  "JEV",
  "Free email",
  "Domain email",
  "Unlimited aliases"
];

function testFactsStayInSync() {
  console.log("\nFacts stay in sync");
  const api = fs.readFileSync(path.join(ROOT, "api/ask.js"), "utf8");
  const worker = fs.readFileSync(path.join(ROOT, "worker.mjs"), "utf8");
  const portfolio = fs.readFileSync(path.join(ROOT, "portfolio.js"), "utf8");
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

  const apiFacts = extractFacts(api);
  const workerFacts = extractFacts(worker);
  check("both endpoints carry a facts block", apiFacts.length > 0 && workerFacts.length > 0);
  check(
    "the two endpoints have identical facts",
    apiFacts === workerFacts,
    "api/ask.js and worker.mjs have drifted apart — copy one over the other"
  );

  const guide = portfolio.slice(portfolio.indexOf("const localAnswers"));
  CANONICAL_FACTS.forEach((fact) => {
    check("facts block mentions: " + fact, apiFacts.indexOf(fact) !== -1);
    check("the local guide mentions: " + fact, guide.indexOf(fact) !== -1);
  });

  PAGE_FACTS.forEach((fact) => {
    check("the page states: " + fact, html.indexOf(fact) !== -1);
  });
}

/* ── 8. a missing endpoint is not asked for twice ──────────────────────── */

async function testEndpointCaching() {
  console.log("\nEndpoint caching (portfolio.js)");
  let calls = 0;
  const dom = buildDom({
    fetch: async () => {
      calls++;
      return { ok: false, status: 404, json: async () => ({}) };
    }
  });
  runPortfolio(dom);

  dom.elements["assistant-question"].value = "What is SentryML?";
  dom.elements["assistant-form"].dispatch("submit", { preventDefault() {} });
  await new Promise((resolve) => setTimeout(resolve, 20));
  check("the first question does try the endpoint", calls === 1, "calls: " + calls);
  check("and the guide answers it", dom.elements["assistant-answer"].textContent.indexOf("churn") !== -1);

  dom.elements["assistant-question"].value = "What did SafeOps AI prove?";
  dom.elements["assistant-form"].dispatch("submit", { preventDefault() {} });
  await new Promise((resolve) => setTimeout(resolve, 20));
  check("a missing endpoint is not asked for again", calls === 1, "calls: " + calls);
  check("the guide still answers", dom.elements["assistant-answer"].textContent.indexOf("JEV") !== -1);
}

/* ── 9. the server finishes before the browser gives up ──────────────────── */

function testTimeoutsLineUp() {
  console.log("\nTimeouts line up");
  const api = fs.readFileSync(path.join(ROOT, "api/ask.js"), "utf8");
  const worker = fs.readFileSync(path.join(ROOT, "worker.mjs"), "utf8");
  const portfolio = fs.readFileSync(path.join(ROOT, "portfolio.js"), "utf8");
  const read = (source, name) => {
    const match = source.match(new RegExp(name + " = ([\\d_]+)"));
    return match ? Number(match[1].replace(/_/g, "")) : NaN;
  };
  const clientAbort = read(portfolio, "15_000") || (portfolio.indexOf("15_000") !== -1 ? 15000 : NaN);

  check("the browser aborts at 15 seconds", clientAbort === 15000, String(clientAbort));
  check("the api endpoint finishes before that", read(api, "TOTAL_TIMEOUT_MS") < 15000, String(read(api, "TOTAL_TIMEOUT_MS")));
  check("the worker finishes before that", read(worker, "TOTAL_TIMEOUT_MS") < 15000, String(read(worker, "TOTAL_TIMEOUT_MS")));
  check(
    "the total budget allows more than one attempt",
    read(api, "TOTAL_TIMEOUT_MS") > read(api, "ATTEMPT_TIMEOUT_MS"),
    read(api, "TOTAL_TIMEOUT_MS") + " vs " + read(api, "ATTEMPT_TIMEOUT_MS")
  );
}

/* ── run ────────────────────────────────────────────────────────────────── */

(async () => {
  await testGuide();
  await testProviders();
  await testWorker();
  testMotionFailsafe();
  testMenu();
  testMotionPlayState();
  testFactsStayInSync();
  await testEndpointCaching();
  testTimeoutsLineUp();
  console.log("\n" + passed + " passed, " + failed + " failed");
  process.exit(failed ? 1 : 0);
})();
