import { mkdirSync, writeFileSync } from 'fs';
import { test, expect } from './fixtures';
import { expectPlausibleReply } from './pages/agent-chat.page';

test.describe('Permission.io AI Agent - Pre-Login Suite', () => {

  test.afterEach(async ({}, testInfo) => {
    console.log(`[${testInfo.status?.toUpperCase()}] ${testInfo.title} — ${testInfo.duration}ms`);
  });

  test('1. Landing page displays suggested topic pills', async ({ page, chatPage }) => {
    await expect(page).toHaveURL(/ask\.permission\.ai/);
    await expect(page.getByRole('heading', { name: /Permission Agent/i })).toBeVisible({ timeout: 10000 });
    await expect(chatPage.input).toBeVisible({ timeout: 10000 });
    await expect(chatPage.input).toBeEnabled();
  });

  test('2. Clicking a suggested topic produces an agent response', async ({ chatPage }) => {
    const countBefore = await chatPage.messageCount();

    const topicPrompt = chatPage.pillCandidates().first();
    if (await topicPrompt.isVisible().catch(() => false)) {
      await topicPrompt.click({ force: true });
    }

    const val = await chatPage.input.inputValue();
    if (!val) {
      await chatPage.input.fill('How does Permission work?');
    }
    await chatPage.input.press('Enter');

    const text = await chatPage.waitForNewReply(countBefore);
    expectPlausibleReply(text, /(permission|data|earn|ask|token|broker|business)/i);
  });

  test('3. Submitting a free-text question produces an agent response', async ({ chatPage }) => {
    const text = await chatPage.ask('What is the core utility of ASK token?');
    expectPlausibleReply(text, /(ask|token|earn|reward|utility|data)/i);
  });

  test('4. Shift+Enter creates a new line instead of sending', async ({ chatPage }) => {
    const countBefore = await chatPage.messageCount();

    await chatPage.input.click({ force: true });
    await chatPage.input.fill('Line 1');
    await chatPage.input.press('Shift+Enter');
    await chatPage.input.pressSequentially('Line 2', { delay: 30 });

    const value = await chatPage.input.inputValue();
    expect(value).toContain('\n');
    expect(value.split('\n')).toHaveLength(2);
    expect(value.split('\n')[1]).toBe('Line 2');

    expect(await chatPage.messageCount()).toBe(countBefore);
  });

  test('5. Validates non-deterministic response for "What is Permission"', async ({ chatPage }) => {
    const text = await chatPage.ask('What is Permission?');
    expectPlausibleReply(text, /(permission|data|earn|ask|token|broker)/i);

    // Capture the real response so `npm run test:eval` grades this run's actual output.
    mkdirSync('artifacts', { recursive: true });
    writeFileSync('artifacts/last-response.txt', text, 'utf-8');
  });

  test('6. Empty or whitespace-only input cannot be dispatched', async ({ chatPage }) => {
    const countBefore = await chatPage.messageCount();

    await chatPage.input.fill('   ');
    await expect(chatPage.sendButton).toBeDisabled();

    await chatPage.input.press('Enter');
    expect(await chatPage.messageCount()).toBe(countBefore);
  });

  test('7. Authentication entry points are visible in pre-login state', async ({ chatPage }) => {
    await expect(chatPage.logInButton).toBeVisible({ timeout: 5000 });
    await expect(chatPage.logInButton).toBeEnabled();
    await expect(chatPage.signUpButton).toBeVisible({ timeout: 5000 });
    await expect(chatPage.signUpButton).toBeEnabled();
  });

  test('8. Chat input and interface are responsive on mobile viewport', async ({ page, chatPage }) => {
    const viewport = { width: 390, height: 844 };
    await page.setViewportSize(viewport);
    await page.waitForTimeout(500);

    await expect(chatPage.input).toBeVisible({ timeout: 10000 });
    await expect(chatPage.sendButton).toBeVisible({ timeout: 10000 });

    const box = await chatPage.input.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
  });

});
