# AI Usage Disclosure

## Tools used, and why

**Claude** for test strategy, drafting docs, and data-model reasoning. Chose it over Copilot/Cursor because the hard part here is reasoning — which assertions survive a non-deterministic response, what a signup implies about tables — not autocomplete.

**Promptfoo** for the Part 2 LLM-eval, over DeepEval/Ragas, because it's a standalone CLI against a saved response file — no extra harness code, and it stays decoupled from the Playwright run.

## Generated vs. rewritten vs. hand-built

**Generated, lightly edited:** first drafts of `ux-review.md` and `data-checks.md` — the structure and SQL shape came from AI, but I replaced generic lines ("improve UX") with specific defects I actually saw (OneTrust modal blocking clicks, bare signup form).

**AI drafted, I rewrote:** initial locators used `role=main` and text regex on the response; no `main` role exists on the page. I rewrote the wait strategy around visibility + length instead of polling exact text.

**Built by hand:** which 8 tests to keep, the `assertions.md` design, and all real-failure debugging — AI proposes test ideas but can't watch a run fail and diagnose why.

## One AI mistake caught

Claude's message locator (`main p, div[class*="chat"] p, p:not([id*="ot-"])`) silently matched the wrong element: it let through the static hero tagline, `<p data-testid="ai-page-description">Here to help you Earn More</p>`, which won `.last()` over the real reply — a passing test that validated page chrome, not the agent's answer. I caught it by dumping every `<p>`'s text mid-run and seeing the "response" was 27 characters of marketing copy. Fixed by excluding that exact testid instead of guessing at CSS classes.

## What I didn't trust to AI

Wait strategy and the assertion design (structural checks over exact-match) — both require reasoning about real failure modes in this app, not a generic pattern.
