export const contact = {
  email: 'chavanpiyush100@gmail.com',
  github: 'https://github.com/Piyush70007',
  linkedin: 'https://www.linkedin.com/in/piyush-chavan-976a23225/',
  // Add an approved, public PDF here when Piyush supplies it.
  cv: null,
};

export const education = [
  {
    id: 'ue', level: 'POSTGRADUATE', degree: 'Master’s in Software Engineering',
    university: 'University of Europe for Applied Sciences', location: 'Potsdam, Germany',
    date: 'Completed August 2026', dateTime: '2026-08',
    logo: '/assets/ue-logo.png', url: 'https://www.ue-germany.com/',
  },
  {
    id: 'sppu', level: 'UNDERGRADUATE', degree: 'Bachelor of Business Administration and Computer Application',
    university: 'Savitribai Phule Pune University', location: 'Pune, India',
    date: 'August 2021 — June 2023', dateTime: '2023-06',
    logo: '/assets/sppu-emblem.jpg', url: 'https://unipune.ac.in/',
  },
];

const facts = [
  { id: 'mivvy', pattern: /\b(mivvy|andrea|jarvis|ultron|voice|voices|voice assistant|desktop assistant)\b/i, answer: 'Mivvy is Piyush’s Windows voice assistant and web companion. It offers Andrea, Jarvis, and Ultron identities, expressive speech, and hands-free conversation. The Windows build supports selected desktop and browser commands. The web companion focuses on conversations and personal tools such as tasks, reminders, expenses, notes, and habits. Linked laptop views are restricted to its owner account. Supported actions and cloud response speed have practical limits.', link: '#mivvy', label: 'Explore Mivvy' },
  { id: 'openmail', pattern: /\b(openmail|aliases?|mailboxes?|inbox|domain)\b/i, answer: 'OpenMail turns a domain you own into a working email space. Create addresses such as support@yourdomain.com, send and receive mail, and set up AI representatives using your company knowledge. It includes practice tests, mail rules, and result reviews. Domain verification is required, and account and provider limits apply.', link: '#openmail', label: 'Explore OpenMail' },
  { id: 'sentry', pattern: /\b(sentry\w*|churn|xgboost|prediction|predict)\b/i, answer: 'SentryML Risk Engine is a customer-churn prediction API. It serves an XGBoost model through FastAPI, logs predictions, and exposes drift and model-health endpoints. Its real interface is the API documentation linked in the work section.', link: '#sentryml', label: 'Explore SentryML' },
  { id: 'safeops', pattern: /\b(safeops|guardrails?|agents?|policy|opa|rollback)\b/i, answer: 'SafeOps AI is an in-progress learning lab for safer AI operations. Agents investigate and propose changes; a policy layer authorizes tool calls, deterministic checks verify changes, and Argo Rollouts handles promotion or rollback. It is a portfolio lab, not a production remediation service.', link: '#safeops', label: 'Explore SafeOps AI' },
  { id: 'education', pattern: /\b(education|degree|university|masters?|bachelors?|stud\w*|graduat\w*|college|qualification\w*)\b/i, answer: 'Piyush completed his Master’s in Software Engineering at the University of Europe for Applied Sciences in Potsdam, Germany, in August 2026. His Bachelor of Business Administration and Computer Application at Savitribai Phule Pune University ran from August 2021 to June 2023.', link: '#education', label: 'View education' },
  { id: 'contact', pattern: /\b(contact|hire|reach|email|linkedin|cv|resume|availability|salary)\b/i, answer: 'You can reach Piyush at chavanpiyush100@gmail.com. His GitHub and LinkedIn are linked in the contact section. For his latest CV, availability, or a specific opportunity, contact him directly.', link: '#cv', label: 'CV & contact' },
  { id: 'projects', pattern: /\b(projects?|built|build\w*|work|made)\b/i, answer: 'Piyush’s four featured projects are OpenMail for custom-domain email and AI assistance, Mivvy for voice conversation and supported desktop actions, SentryML for customer-churn prediction, and SafeOps AI for policy-controlled agent operations. The project sections explain their scope and link to the live products or source where available.', link: '#work', label: 'View selected work' },
  { id: 'about', pattern: /\b(who|about|skills?|stack|focus|berlin|piyush|python|fastapi|docker|kubernetes)\b/i, answer: 'Piyush is an AI developer based in Berlin. His projects explore applied AI, machine learning, LLM systems, and safer agent operations, using tools such as Python, FastAPI, XGBoost, Docker, and Kubernetes. He learns by building useful, inspectable systems.', link: '#about', label: 'Meet Piyush' },
];

export function localAnswer(question) {
  const text = String(question).trim().slice(0, 400);
  if (!text) return null;
  return facts.find(fact => fact.pattern.test(text)) || {
    id: 'unknown', answer: 'I only know Piyush’s published portfolio facts. Ask about his projects, education, or skills. For anything personal or not covered here, please contact him directly.', link: '#contact', label: 'Contact Piyush',
  };
}

export function assistantEndpoint(origin) {
  return ['https://piyushchavan.com', 'https://www.piyushchavan.com'].includes(origin)
    ? 'https://piyush-portfolio-assistant.piyushchavan-dev.workers.dev' : null;
}
