# Non-Deterministic Response Validation Strategy

Topic under test: "What is Permission?" — implemented in `tests/agent.spec.ts`, test 5, via `expectPlausibleReply` in `tests/pages/agent-chat.page.ts` (also used by tests 2 and 3, so every AI reply in the suite is graded the same way).

### What we assert

1. **Size floor**: `text.length > 20`. Catches empty bubbles and truncated streams.
2. **Domain-keyword presence**: `/(permission|data|earn|ask|token|broker)/i`. The answer has to actually be about Permission.io, not a generic filler reply.
3. **Error-signature negation**: response must not contain `internal server error`, `unauthorized`, or `failed to fetch` — catches a broken backend disguised as a "response."
4. **LLM-graded rubric (Promptfoo)**: test 5 writes the captured text to `artifacts/last-response.txt`; `promptfooconfig.yaml` reads that file and re-runs the same three checks plus an `llm-rubric` assertion: *"explains what Permission.io is or does, in a way a new user could follow — not an error message, refusal, or off-topic reply."* Run it with `npm run test:eval` (needs `OPENAI_API_KEY`; grader is `gpt-4o-mini`).

### What we deliberately do NOT assert

- **Exact text or word count** — the model rephrases every run; pinning a string makes the suite flaky by construction.
- **Response latency** — depends on server load, not correctness.
- **Paragraph/bullet structure** — the agent sometimes answers in one sentence, sometimes three; structure isn't the thing under test.

### Why an LLM-rubric, not just regex

The keyword regex would pass on a reply like *"Permission data data data,"* which is nonsense repeating matched words — plain assertions can't tell coherent from garbled. `llm-rubric` reads for actual meaning: does the text explain the product, or just contain the right words. That's the failure mode a plain assertion can't catch, and the reason this isn't inline-in-Playwright.
