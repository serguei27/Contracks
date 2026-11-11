# Contracks

Website for Contracks Global. Static pages, published with Netlify. Not yet connected to a live address.

Private working files never go in this public repo.

## Delivery Score (score engine 1.0.0)

The quiz lives at `/quiz` (`quiz.html`, `quiz.js`). Old addresses (`/control-assessment`, `/control-results-page`, `/control-report`) redirect there with a 301.

- `score-engine.js`: shared 5Cs scoring. 15 Yes/No questions, 3 per C. Each C = good answers ÷ 3 (0, 33, 67 or 100). Total = good answers ÷ 15 × 100, rounded to the nearest whole number, so it moves in steps of about 6.67 and each C weighs 20%. Bands: Fragile 0–39, Exposed 40–69, Resilient 70–100. Reachable band changes: 33 → 40 and 67 → 73. The weakest C is the lowest score; a tie goes to the earlier C (CONTAIN, COMMAND, CLOSE, CONFIRM, CONTROL).
- `contracks.config.js`: questions, The Delivery Control Ladder™ levels on reachable totals (Reactive 0–20, Managed 27–33, Controlled 40–67, Operational 73–87, Scalable 93–100), result copy, best-fit rule and call button.
- `contact-form.js`: the standard contact form (`contracks-call`) on the homepage and `/quiz`. The score reaches it from the browser tab's session storage, never from the address.
- Netlify forms: `delivery-score-report` (report unlock) and `contracks-call` (call requests). Each submission carries `brand`, `engine_version`, `config_version`, `score_version` and, for the report, `assessment_object`.
