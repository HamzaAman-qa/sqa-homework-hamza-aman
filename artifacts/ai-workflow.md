# AI Usage Disclosure

## Tools Used & Selection

**Claude (Anthropic)** as the primary AI assistant for:
- Brainstorming test strategy and edge cases
- Drafting UX review observations and improvement narratives
- Reasoning about the data model and writing SQL patterns
- Structuring documentation files

**Why Claude over alternatives:**
- Strong at reasoning through ambiguous problems (inferring backend from UI behavior, designing assertion strategies)
- Long context window (suitable for full test file, documentation review)
- Good at balancing conciseness (required by the challenge) with specificity (no templates)
- API integration straight forward for the semantic-eval test

**Deepeval + Claude API** for semantic evaluation of non-deterministic responses:
- Chose Claude's reasoning API over generic LLM evals to avoid false positives
- Avoids need for external eval services; self-contained in the test suite

## What I Generated With AI vs. What I Rewrote

### Generated (AI-first, minimal rewrites)
- **First pass of data-checks.md**: Claude suggested the table structure and queries; I refined query comments and added the pipeline integrity check based on domain reasoning.
- **UX review initial observations**: Claude helped structure "What works" vs. "What's rough"; I replaced generic language ("improve UX") with specific, observable problems (cookie modal, bare signup form, mobile tap targets).
- **Assertion strategy (assertions.md)**: Claude outlined assertion types; I tightened language and removed waffle about "best practices."

### Rewritten (AI drafted, I corrected)
- **Test locators and waiting strategy**: Claude suggested generic Playwright patterns. I debugged real failures (OneTrust modal blocking clicks, "main" role not existing) and replaced with production-ready solutions (input disabled state, page text checks).
- **Suggested topics discovery**: Claude assumed they'd be obvious in the DOM. I observed they only appear on desktop landing page, not on all routes — adjusted test accordingly.

### Built by Hand (No AI)
- **Running and iterating the test suite**: Manual debugging of timeouts, locator failures, and DOM structure. Playwright dev cycle requires hands-on troubleshooting.
- **Choosing which 8 tests to write**: While AI can suggest test cases, I prioritized based on the spec (4 required + 4 judgment calls on edge cases, mobile, auth).
- **Connecting DeepEval to the test flow**: The integration (capturing response text, calling Claude evaluator, parsing JSON) required understanding the test harness and Anthropic SDK.

## AI Mistake Caught

**Mistake:** Claude suggested filtering chat messages with `p:not([id*="ot-"])` (excluding OneTrust paragraphs). This failed because:
1. OneTrust elements had class names like `ot-grp-desc`, not ID prefixes.
2. The page structure used `<div>` and `<generic>` elements for messages, not `<p>` tags.
3. My initial error message "No chat messages found in main content" was misleading; the selector was wrong, not the content.

**How I caught it:** Screenshot from test failure (error-context.md) showed the actual page tree. Saw `<generic [ref=e46]: Permission is typing...` and realized messages weren't in `<p>` tags. Rewrote locator strategy to check page text content instead of hunting for specific DOM elements.

## Deliberate Choices Not Trusted to AI

1. **Wait strategy**: Checked if input becomes disabled (agent responding) instead of polling for text. This is more reliable than regex patterns which can match unrelated content (cookies, footers). Designed this by understanding the streaming flow, not from a template.

2. **Non-deterministic assertion design**: Chose structural checks (length, domain keywords, error absence) over exact-match or LLM-judge. Validated this by reasoning about failure modes: what would actually indicate a broken system vs. natural variation in response.

3. **Mobile viewport size**: Used 390x844 (iPhone 12) not 375x667 (older iPhone). Matters for verifying button sizes and overflow behavior. AI doesn't reason about device generations well.

4. **Test count (8)**: Included "Shift+Enter multiline," "empty input disable," and "mobile responsive" — not because AI suggested them, but because they cover real user behavior and interaction edge cases that matter.

## Summary

AI accelerated planning and documentation; hands-on work was debugging the actual product and wiring assertions to reality. The challenge's "generic response" detection is apt — I removed boilerplate, kept observations specific (cookie modal, not "improve UX"), and justified every decision.
