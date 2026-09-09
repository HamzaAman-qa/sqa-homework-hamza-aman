import { type Page, type Locator, expect } from '@playwright/test';

export class AgentChatPage {
  readonly page: Page;
  readonly input: Locator;
  readonly sendButton: Locator;
  readonly logInButton: Locator;
  readonly signUpButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.input = page.getByTestId('agent-chat-input');
    this.sendButton = page.getByTestId('agent-chat-input-send-button');
    this.logInButton = page.getByRole('button', { name: 'Log in' });
    this.signUpButton = page.getByRole('button', { name: 'Sign Up' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    await this.dismissCookieBanner();
    await this.waitForMessagesToSettle();
  }

  private async dismissCookieBanner(): Promise<void> {
    const acceptBtn = this.page.locator('#onetrust-accept-btn-handler, button:has-text("Accept All")');
    if (await acceptBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await acceptBtn.click();
    }
    await this.page.evaluate(() => document.getElementById('onetrust-consent-sdk')?.remove());
  }

  // Excludes the static hero tagline (data-testid="ai-page-description") so `.last()` picks the newest chat bubble, not page chrome.
  messages(): Locator {
    return this.page.locator('p:not([data-testid="ai-page-description"]):not([id*="ot-"]):not([class*="ot-"])').filter({
      hasNotText: /(Shift|Enter for new line|By using Permission|Terms of Use|Privacy Policy)/i,
    });
  }

  messageCount(): Promise<number> {
    return this.messages().count();
  }

  pillCandidates(): Locator {
    return this.page.locator('p, button, span').filter({
      hasText: /(understand Permission|Permission\.ai|earn|assist you)/i,
    });
  }

  // The site's own greeting streams in asynchronously and can settle after a
  // test has already started interacting; poll until it stops changing.
  private async waitForMessagesToSettle(): Promise<void> {
    let previous: string | null = null;
    for (let i = 0; i < 12; i++) {
      const count = await this.messageCount();
      const current = count > 0 ? await this.messages().last().innerText().catch(() => '') : '';
      if (current && current === previous && !/typing/i.test(current)) return;
      previous = current;
      await this.page.waitForTimeout(500);
    }
  }

  // Polls the message COUNT past its baseline instead of "a reply is visible" —
  // that's trivially true of the pre-existing greeting before a new one renders.
  async waitForNewReply(countBefore: number): Promise<string> {
    const messages = this.messages();
    await expect
      .poll(() => messages.count(), { timeout: 25000, message: 'waiting for a new agent message' })
      .toBeGreaterThan(countBefore);

    const reply = messages.last();
    await expect(reply).toHaveText(/.{20,}/, { timeout: 10000 });
    return reply.innerText();
  }

  async ask(question: string): Promise<string> {
    const countBefore = await this.messageCount();
    await this.input.fill(question);
    await this.input.press('Enter');
    return this.waitForNewReply(countBefore);
  }
}

// Fails on the failure modes that actually matter (empty, off-topic, backend error) —
// never on exact phrasing, since that's different every run by design.
export function expectPlausibleReply(text: string, topicRegex: RegExp): void {
  expect(text.length).toBeGreaterThan(20);
  expect(text).toMatch(topicRegex);
  expect(text).not.toMatch(/(internal server error|unauthorized|failed to fetch|undefined)/i);
}
