// No-op provider: relays the captured response text straight through so
// promptfoo's assertions grade the real Playwright-captured output, not a
// live model call for the provider step itself.
class EchoProvider {
  id() {
    return 'echo';
  }
  async callApi(prompt) {
    return { output: prompt };
  }
}

module.exports = EchoProvider;
