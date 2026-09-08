# Non-Deterministic Response Validation Strategy

Validating LLM streaming responses requires decoupling semantic validity from literal string equality. Exact text assertions are anti-patterns in non-deterministic systems.

### What We Assert
1. **Streaming Completion & Size Floor:** The message container must settle and exceed a character floor (`length > 25`). Empty or truncated bubbles fail immediately.
2. **Domain Entity Heuristic (Regex):** For queries like *"What is Permission?"*, the response must match core business terms: `/(permission|data|broker|earn|ask|token)/i`.
3. **Safety & Runtime Negation Checks:** We explicitly assert that error signatures do not appear: `/(internal server error|unauthorized|failed to fetch|undefined)/i`.
4. **LLM Semantic Evaluation (Promptfoo):** Integrated via `promptfooconfig.yaml`. Promptfoo executes lightweight semantic assertions against the captured agent output, verifying intent and concept delivery rather than token ordering.

### What We Deliberately Do NOT Assert
* **Exact String Matching:** Model temperature, system prompt updates, and dynamic formatting introduce variations that make strict text checks brittle.
* **Stream Timing / Generation Latency:** Token latency varies based on server load and network jitter. Rigid timing assertions cause flaky CI runs.
* **Layout / Bullet Order:** How the LLM structures paragraphs or bullet lists is variable and does not impact informational correctness.

### Why Promptfoo?
Plain regex confirms keyword presence but cannot verify semantic coherence. Promptfoo provides automated LLM grading to catch hallucinations where keywords exist in a grammatically broken or invalid context.