(() => {
  "use strict";

  const page = document.body;
  page.classList.add("has-motion");

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          activeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".site-nav");
  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
      navigation.classList.toggle("is-open", !isOpen);
      page.classList.toggle("menu-open", !isOpen);
    });
    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation");
        navigation.classList.remove("is-open");
        page.classList.remove("menu-open");
      });
    });
  }

  const form = document.getElementById("assistant-form");
  const input = document.getElementById("assistant-question");
  const answerPanel = document.getElementById("assistant-answer");
  const sendButton = form ? form.querySelector("button[type='submit']") : null;
  const status = document.getElementById("assistant-status-text");
  const statusGroup = document.querySelector(".assistant-status");

  const localAnswers = [
    {
      test: /sentry|churn|risk engine|machine learning|xgboost|fastapi/,
      answer: "SentryML is Piyush’s machine-learning project for predicting customer churn. It uses an XGBoost model behind a FastAPI service, logs predictions, and includes basic drift and model-health monitoring. The live API documentation and source code are linked in the project card."
    },
    {
      test: /safeops|guardrail|ai operations|agent|opa|rollout/,
      answer: "SafeOps AI is an in-progress learning lab about safer AI operations. Policy checks constrain tool calls, deterministic gates verify changes, and Argo Rollouts can promote or roll back a release. It is a portfolio lab, not a production autonomous-remediation service."
    },
    {
      test: /openmail|email|mailbox|custom domain/,
      answer: "OpenMail is Piyush’s product exploration for custom-domain email. It has a live product preview; its mail-service foundation is still evolving. The project card links to the preview."
    },
    {
      test: /education|university|degree|master|study|graduat/,
      answer: "Piyush completed a Master’s in Software Engineering at the University of Europe for Applied Sciences in Potsdam, Germany, in August 2026."
    },
    {
      test: /about|who is piyush|who are you|direction|focus|special/,
      answer: "Piyush is an AI-focused developer learning by building practical projects. His current interests include applied AI, machine learning, LLM safety, and products shaped around everyday needs."
    },
    {
      test: /contact|email|reach|linkedin|github/,
      answer: "You can contact Piyush at chavanpiyush100@gmail.com, or use the GitHub and LinkedIn links in the contact section."
    }
  ];

  function setStatus(label, state) {
    if (status) status.textContent = label;
    if (statusGroup) statusGroup.dataset.state = state || "ready";
  }

  function localAnswer(question) {
    const normalized = question.toLowerCase();
    const match = localAnswers.find((entry) => entry.test.test(normalized));
    if (match) return match.answer;
    return "I can help with questions about Piyush, his education, or the three projects shown here: SentryML, SafeOps AI, and OpenMail. Try asking about one of those.";
  }

  function showAnswer(question, text, localMode) {
    answerPanel.replaceChildren();
    const label = document.createElement("p");
    label.className = "answer-question";
    label.textContent = localMode ? "Portfolio guide · using published project details" : "Portfolio AI · Claude";
    const response = document.createElement("p");
    response.textContent = text;
    answerPanel.append(label, response);
    answerPanel.hidden = false;
    setStatus(localMode ? "GUIDE MODE" : "CLAUDE AI", localMode ? "offline" : "ready");
    answerPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  async function ask(question) {
    const cleaned = question.trim().slice(0, 400);
    if (!cleaned) return;
    answerPanel.hidden = true;
    setStatus("THINKING", "thinking");
    if (sendButton) sendButton.disabled = true;
    if (input) input.disabled = true;

    try {
      const endpoint = window.PORTFOLIO_AI_API_URL || "/api/ask";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: cleaned })
      });
      if (!response.ok) throw new Error("Portfolio AI is not configured on this host.");
      const data = await response.json();
      if (!data || typeof data.answer !== "string" || !data.answer.trim()) {
        throw new Error("The assistant returned no answer.");
      }
      showAnswer(cleaned, data.answer.trim(), false);
    } catch (_error) {
      showAnswer(cleaned, localAnswer(cleaned), true);
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
