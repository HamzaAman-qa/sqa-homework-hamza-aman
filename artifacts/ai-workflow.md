# AI Usage Disclosure

## Tools used, and why

**Claude** for test strategy, drafting docs, and reasoning about the data model. Chose it over Copilot/Cursor because the hard part here is reasoning (which assertions survive a non-deterministic response, what tables a signup implies), not autocomplete.

**Promptfoo** for the LLM-eval check in Part 2, over DeepEval/Ragas, because it runs as a standalone CLI against a saved response with no extra harness code — keeps the eval decoupled from the Playwright run.

## Generated vs. rewritten vs. hand-built

**Generated, lightly edited:** first drafts of `ux-review.md` and `data-checks.md` — the structure and SQL shape came from AI, but I replaced generic lines ("improve UX") with specific defects I actually saw (OneTrust modal blocking clicks, bare signup form).

**AI drafted, I rewrote:** initial locators used generic Playwright patterns (`role=main`, text regex on the response). Both failed — no `main` role exists, and the response renders in `<div>`/`<generic>` nodes, not `<p>`. I rewrote the wait strategy around the input's disabled state instead of polling text.

**Built by hand:** which 8 tests to keep, the assertion design in `assertions.md`, and all debugging of real failures — AI can propose test ideas but can't watch a real run fail and diagnose why.

## One AI mistake caught

Claude suggested filtering chat text with `p:not([id*="ot-"])` to exclude the OneTrust cookie banner. It doesn't work — OneTrust uses class names like `ot-grp-desc`, not id prefixes, and messages aren't in `<p>` tags. I caught it from the Playwright trace's accessibility tree and switched to a page-text-content check instead of DOM-shape matching.

## What I didn't trust to AI

Wait strategy and the non-deterministic assertion design (structural checks over exact-match) — both require reasoning about actual failure modes in this specific app, not a generic pattern.
