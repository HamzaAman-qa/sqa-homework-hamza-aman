# Senior Quality Assurance Engineer — Take-Home Submission

Automated test suite and architecture validation for https://ask.permission.ai.

## Setup & Execution

Verify from clean clone in ~2 minutes:

```bash
# 1. Install dependencies
npm install

# 2. Install Chromium browser binary
npx playwright install chromium

# 3. Run all 8 automated tests
npm test

# 4. (Optional) Run LLM response eval check
npm run test:eval

# 5. View test report
npx playwright show-report artifacts/report
```

## Test strategy (TL;DR)

Covered: the 4 required behaviors (pills visible, topic click → response, free-text → response, Shift+Enter newline) plus 4 judgment calls: the non-deterministic-response assertion (Part 2), empty/whitespace input can't be sent, log in / sign up entry points are visible, and mobile viewport layout.
Skipped: post-login flows (automation stays pre-login per the brief), cross-browser matrix, and visual regression — none add signal within an 8-test budget for a single public page.

## Key decisions

- **Locators**: `getByTestId` for the input and send button (`agent-chat-input`, `agent-chat-input-send-button`) — these survive copy/layout changes; only a `data-testid` rename breaks them, versus CSS classes which the site already changes between routes.
- **Waiting strategy**: no fixed sleeps or exact-text matches on the streamed response. I wait on `visible` + a length assertion (`/.{20,}/`), since the response text is different every run but its *presence and shape* aren't.
- **Non-deterministic assertion (Part 2)**: structural checks (length, domain-keyword presence, absence of error strings) instead of exact-match or LLM-judge-only — see `artifacts/assertions.md`.
- **OneTrust handling**: the cookie banner intercepts clicks intermittently; `beforeEach` accepts it if present and removes the DOM node, rather than adding retries to every test.
- **Eval framework**: Promptfoo wired in as a separate `npm run test:eval` step rather than inline in Playwright, so a flaky LLM judge can't block the core suite.
- **Test count (8, not fewer)**: included empty-input and mobile-viewport checks because they're real interaction edge cases users hit, not padding.

## AI disclosure

See `artifacts/ai-workflow.md` for tools used, what was AI-drafted vs. hand-built, and one AI mistake I caught.

## Next steps

With 1–2 more days: add a GitHub Actions workflow gating merges on this suite, a second eval assertion (tone/refusal detection) in Promptfoo, and a small post-login smoke check once auth automation is in scope.

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
- [ ] `artifacts/demo.mp4` included (60–90 sec, narrated)
- [x] Commit history shows how the work evolved