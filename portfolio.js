(() => {
  "use strict";

  const page = document.body;
  page.classList.add("has-motion");

  const revealItems = Array.from(document.querySelectorAll(".reveal, .reveal-fade"));
  // Groups whose decorative motion should only run while they are on screen.
  const motionGroups = Array.from(document.querySelectorAll("[data-motion]"));

  function revealAll() {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  // Belt and braces. The observer is the primary trigger, but a scroll sweep
  // runs alongside it so a reveal target can never be left permanently
  // hidden — if an ancestor becomes a scroll container the observer's root
  // stops matching and the sweep picks up the slack.
  function sweep() {
    const limit = window.innerHeight * 0.92;
    revealItems.forEach((item) => {
      if (item.classList.contains("is-visible")) return;
      const rect = item.getBoundingClientRect();
      if (rect.top < limit && rect.bottom > 0) item.classList.add("is-visible");
    });
    // Motion runs only while its group is actually in view, so nothing
    // animates off screen for the whole session.
    motionGroups.forEach((group) => {
      const rect = group.getBoundingClientRect();
      group.classList.toggle("is-inview", rect.top < limit && rect.bottom > 0);
    });
  }

  let sweepQueued = false;
  function scheduleSweep() {
    if (sweepQueued) return;
    sweepQueued = true;
    window.requestAnimationFrame(() => {
      sweepQueued = false;
      sweep();
    });
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          activeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -8% 0px" });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealAll();
  }

  window.addEventListener("scroll", scheduleSweep, { passive: true });
  window.addEventListener("resize", scheduleSweep, { passive: true });
  sweep();

  // The reveal system is wired, so the head script can stop guarding against a
  // portfolio.js that failed to boot.
  document.documentElement.classList.add("motion-ready");

  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".site-nav");
  if (menuButton && navigation) {
    const firstLink = navigation.querySelector("a");
    const setMenuOpen = (open, restoreFocus) => {
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      navigation.classList.toggle("is-open", open);
      page.classList.toggle("menu-open", !open);
      if (open && firstLink) firstLink.focus();
      else if (!open && restoreFocus) menuButton.focus();
    };
    menuButton.addEventListener("click", () => {
      setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true", true);
    });
    navigation.querySelectorAll("a").forEach((link) => {
      // Following a link should not pull focus back to the button — the page
      // is about to scroll to the section.
      link.addEventListener("click", () => setMenuOpen(false, false));
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
        setMenuOpen(false, true);
      }
    });
  }

  const form = document.getElementById("assistant-form");
  const input = document.getElementById("assistant-question");
  const answerPanel = document.getElementById("assistant-answer");
  const sendButton = form ? form.querySelector("button[type='submit']") : null;
  const status = document.getElementById("assistant-status-text");
  const statusGroup = document.querySelector(".assistant-status");

  /* The local guide. This is what answers when no AI endpoint is configured —
     which is the case on GitHub Pages unless a separate endpoint is set in
     site-config.js. Matching is scored rather than first-hit, so a question
     that mentions two things lands on the stronger match. */
  const localAnswers = [
    {
      id: "safeops",
      keywords: ["safeops", "guardrail", "open policy", "policy engine", "opa", "rollout", "argv", "jev", "red team", "red-team", "20/20", "agent", "canary", "rollback", "gate", "drift-monitored"],
      answer: "SafeOps AI is a learning lab about safer AI operations — a portfolio project, not a production service. An AI agent investigates incidents and proposes patches, but it never decides what it is allowed to touch. JEV routes the work, Open Policy Agent authorises each tool call, deterministic gates verify changes, and Argo Rollouts promotes or rolls back. In a lab run on 3 October 2026 all 20 red-team attacks were blocked, no unverified change reached a canary, 21 agent bot calls were denied by the policy engine, 2 of 5 faulty patches were rejected, and one unhealthy canary rolled back on its own. The source is linked from the project card."
    },
    {
      id: "sentryml",
      keywords: ["sentryml", "churn", "xgboost", "risk engine", "drift", "model health", "prediction", "predict", "monitoring"],
      answer: "SentryML Risk Engine predicts customer churn with an XGBoost model served through FastAPI. It logs every prediction and keeps basic drift and model-health monitoring, so you can see when the model stops matching the data it was trained on. The live API documentation and the source are both linked from the project card."
    },
    {
      id: "openmail",
      keywords: ["openmail", "alias", "aliases", "mailbox", "mailboxes", "custom domain", "domain email", "own domain", "inbox", "free"],
      answer: "OpenMail is a free domain email creator. Point it at a domain you own and you get a working inbox on it, plus as many aliases as you want — each one named whatever suits you. They all read and send through the same proper mail interface. It is currently in preview, and the live preview is linked from the project card."
    },
    {
      id: "education",
      keywords: ["education", "university", "master", "msc", "degree", "bachelor", "bba", "computer application", "savitribai", "pune", "potsdam", "graduat", "studied", "study", "what did he study", "where did he study", "college", "school", "undergrad", "postgrad", "alma mater", "qualification", "qualifications"],
      answer: "Piyush studied a Bachelor of Business Administration and Computer Application at Savitribai Phule Pune University from August 2021 to June 2023. He then did a Master's in Software Engineering at the University of Europe for Applied Sciences in Potsdam, Germany, which he completed in August 2026."
    },
    {
      id: "projects",
      keywords: ["project", "projects", "built", "build", "made", "portfolio", "what does he do", "three"],
      answer: "Three projects. SentryML predicts customer churn and has a live API. SafeOps AI is a lab for guarded AI operations — policy-checked agents with gates and automatic rollback. OpenMail is a free domain email creator with unlimited named aliases. The work section has the detail and links for each."
    },
    {
      id: "contact",
      keywords: ["contact", "reach", "hire", "get in touch", "email", "linkedin", "github", "resume", "cv", "talk", "message", "work with"],
      answer: "The quickest way to reach Piyush is email — chavanpiyush100@gmail.com. His GitHub is github.com/Piyush70007, and the same links plus the resume PDF are in the contact section at the bottom of the page."
    },
    {
      id: "about",
      keywords: ["who is", "about", "focus", "direction", "interested", "interests", "special", "specialise", "specialize", "skills", "stack", "technology", "positioning", "based", "berlin", "location", "ai developer", "machine learning"],
      answer: "Piyush is an AI-focused developer in Berlin. He learns by building practical systems — machine-learning APIs, tools that put guardrails around AI actions, and products shaped around everyday needs. The interests listed on the page are applied AI, machine learning, LLM safety and product building."
    }
  ];

  const FALLBACK_ANSWER = "I can help with Piyush's three projects — SentryML, SafeOps AI and OpenMail — his education, what he focuses on, and how to reach him. Which of those would you like?";

  function setStatus(label, state) {
    if (status) status.textContent = label;
    if (statusGroup) statusGroup.dataset.state = state || "ready";
  }

  function localAnswer(question) {
    const normalized = question.toLowerCase();
    let best = null;
    let bestScore = 0;
    localAnswers.forEach((entry) => {
      let score = 0;
      entry.keywords.forEach((keyword) => {
        if (normalized.indexOf(keyword) !== -1) score += keyword.indexOf(" ") !== -1 ? 2 : 1;
      });
      if (score > bestScore) {
        best = entry;
        bestScore = score;
      }
    });
    return best ? best.answer : FALLBACK_ANSWER;
  }

  function showAnswer(question, text, meta) {
    const local = !!(meta && meta.local);
    const provider = (meta && meta.provider) || "live model";
    answerPanel.replaceChildren();
    const label = document.createElement("p");
    label.className = "answer-question";
    label.textContent = local
      ? "Portfolio guide · using published project details"
      : "Portfolio AI · " + provider;
    const response = document.createElement("p");
    response.textContent = text;
    answerPanel.append(label, response);
    answerPanel.hidden = false;
    setStatus(local ? "GUIDE MODE" : provider.toUpperCase(), local ? "offline" : "ready");
    answerPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // Once the endpoint is known to be missing — GitHub Pages has no /api/ask, and
  // a Vercel deploy with no provider key returns 503 — stop asking for it and
  // answer from the guide straight away. Without this, every question on a
  // static deployment costs a wasted request and a delay.
  let endpointUnavailable = false;

  async function ask(question) {
    const cleaned = question.trim().slice(0, 400);
    if (!cleaned) return;
    answerPanel.hidden = true;
    setStatus("THINKING", "thinking");
    if (sendButton) sendButton.disabled = true;
    if (input) input.disabled = true;

    try {
      const endpoint = typeof window.PORTFOLIO_AI_API_URL === "string"
        ? window.PORTFOLIO_AI_API_URL
        : "/api/ask";
      // An empty endpoint means "guide only" — no point making a request
      // that is going to fail.
      if (!endpoint) throw new Error("No assistant endpoint is configured.");
      if (endpointUnavailable) throw new Error("The assistant endpoint is unavailable.");

      // The endpoint tries several providers and may take up to 25 seconds.
      // Nobody should wait that long: give up at 15 and answer from the
      // local guide instead.
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15_000);
      let response;
      try {
        response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: cleaned }),
          signal: controller.signal
        });
      } finally {
        clearTimeout(timer);
      }

      // 404 means there is no function here. 503 means there is one but no
      // provider key. Both are permanent, so stop asking.
      if (response.status === 404 || response.status === 503) endpointUnavailable = true;
      if (!response.ok) throw new Error("Portfolio AI is not configured on this host.");
      const data = await response.json();
      if (!data || typeof data.answer !== "string" || !data.answer.trim()) {
        throw new Error("The assistant returned no answer.");
      }
      showAnswer(cleaned, data.answer.trim(), {
        local: false,
        provider: data.provider || (data.source ? data.source.charAt(0).toUpperCase() + data.source.slice(1) : "live model")
      });
    } catch (_error) {
      showAnswer(cleaned, localAnswer(cleaned), { local: true });
    } finally {
      if (sendButton) sendButton.disabled = false;
      if (input) {
        input.disabled = false;
        input.value = "";
      }
    }
  }

  if (form && input && answerPanel) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      ask(input.value);
    });
    document.querySelectorAll("[data-prompt]").forEach((chip) => {
      chip.addEventListener("click", () => ask(chip.getAttribute("data-prompt") || ""));
    });
  }
})();
