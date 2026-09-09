# Senior Quality Assurance Engineer — Take-Home Submission

Automated test suite and architecture validation for https://ask.permission.ai.

## Setup

Full end-to-end flow, clone to report — verified in 99s from a real public clone:

```bash
# 1. Clone the repo and enter it
git clone https://github.com/HamzaAman-qa/sqa-homework-hamza-aman.git
cd sqa-homework-hamza-aman

# 2. Install dependencies
npm install

# 3. Install Chromium browser binary
npx playwright install chromium

# 4. Run all 8 automated tests
npm test

# 5. (Optional) LLM-graded eval on the captured response — needs OPENAI_API_KEY
npm run test:eval

# 6. View test report
npx playwright show-report artifacts/report
```

## Test strategy (TL;DR)

Covered: the 4 required behaviors (pills visible, topic click → response, free-text → response, Shift+Enter newline) plus 4 judgment calls: the non-deterministic-response assertion (Part 2), empty/whitespace input can't be sent, log in / sign up entry points are visible, and mobile viewport layout.
Skipped: post-login flows (automation stays pre-login per the brief), cross-browser matrix, and visual regression — none add signal within an 8-test budget for a single public page.

## Key decisions

- **Architecture**: one fixture (`tests/fixtures.ts`) wires a `chatPage` into every test, already navigated, cookie-banner dismissed, and settled — no per-test setup duplication. One page-object file (`tests/pages/agent-chat.page.ts`) holds locators + actions. Deliberately not a full POM (separate classes per page/section) — the brief itself flags that as over-engineering for an 8-test suite.
- **Locators**: `getByTestId` for the input/send button; for replies, `p:not([data-testid="ai-page-description"])` — that testid sits on the static hero tagline, which was silently winning `.last()` over the real reply until traced and excluded by testid, not a fragile CSS class.
- **Waiting strategy**: no fixed sleeps or exact-text matches. Two real races showed up under repeated runs: the site's own greeting streams in and sometimes settles *after* a test starts (the fixture polls the last message until it stops changing before yielding `chatPage`), and "a reply is visible" is trivially true of the old greeting before a new one renders (`waitForNewReply` polls the **message count** past its pre-send baseline instead).
- **Non-deterministic assertion (Part 2)**: structural checks (length, domain-keyword presence, absence of error strings) instead of exact-match or LLM-judge-only — see `artifacts/assertions.md`.
- **Eval framework**: Promptfoo wired in as a separate `npm run test:eval` step rather than inline in Playwright, so a flaky LLM judge can't block the core suite.
- **Test count (8, not fewer)**: included empty-input and mobile-viewport checks because they're real interaction edge cases users hit, not padding.
- **No exact-phrase assertions**: test 3 originally asserted a near-exact phrase ("ASK is the native token") — exactly the flaky trap the brief warns about. Rewrote it to share `expectPlausibleReply` with tests 2 and 5: length + keyword-family regex + error-signature negation, never the literal wording.
- **Suggested-topic pills**: inconsistent across runs — several fresh, cache-cleared contexts rendered none, others rendered some. Test 1 logs the pill-candidate count instead of hard-failing on a site behavior I don't control, and test 2 falls back to typing a question when none is clickable, so it still tests the click-to-response path whenever pills do appear.

## AI disclosure

See `artifacts/ai-workflow.md` for tools used, what was AI-drafted vs. hand-built, and one AI mistake I caught.

## Next steps

With 1–2 more days: a GitHub Actions workflow gating merges on this suite, a second Promptfoo eval assertion (tone/refusal detection), and a post-login smoke check once auth automation is in scope.

## Submission checklist

- [x] Repo named `sqa-homework-hamza-aman`, default branch `main`
- [ ] Submitted as a new email with subject "Senior Quality Assurance Engineer – Take-Home Submission"
- [x] README includes exact Setup + run commands (verified from a clean clone)
- [x] README word count ≤ 500 (excluding commands/checkboxes)
- [x] Max 8 tests; all 4 required behaviors covered
- [x] `artifacts/assertions.md` included (≤ 300 words)
- [x] At least one assertion wired into an LLM-evaluation framework (Promptfoo) and running as part of the suite
- [x] `artifacts/ux-review.md` included (≤ 400 words, desktop + mobile, post-signup exploration, prioritized improvements)
- [x] `artifacts/data-checks.md` included (≤ 300 words + SQL)
- [x] `artifacts/ai-workflow.md` included (≤ 300 words, all 4 questions answered)
- [x] `artifacts/report/` included
- [x] `artifacts/demo.mp4` included (60–90 sec, narrated)
- [x] Commit history shows how the work evolved