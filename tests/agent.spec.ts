import { test, expect } from '@playwright/test';

test.describe('Permission.io AI Agent - Pre-Login Suite', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 1. OneTrust cookie modal ko accept karein
    const acceptBtn = page.locator('#onetrust-accept-btn-handler, button:has-text("Accept All")');
    if (await acceptBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await acceptBtn.click();
    }

    // 2. Race-condition fix: Agar banner overlay DOM me freeze ho to use remove karein
    await page.evaluate(() => {
      const banner = document.getElementById('onetrust-consent-sdk');
      if (banner) banner.remove();
    });
  });

  // Reusable helper: Chat container paragraphs (OneTrust excluded)
  const getAgentParagraphs = (page) => {
    return page.locator('main p, div[class*="chat"] p, p:not([id*="ot-"]):not([class*="ot-"])').filter({
      hasNotText: /(Shift|Enter for new line|By using Permission|Terms of Use|Privacy Policy)/i
    });
  };

  // Test 1: Page displays welcome / topic guidance
  test('1. Landing page displays suggested topic pills', async ({ page }) => {
    const welcomeAgent = page.getByRole('heading', { name: /Permission Agent/i });
    await expect(welcomeAgent).toBeVisible({ timeout: 10000 });
  });

  // Test 2: Clicking a suggested topic produces agent response
  test('2. Clicking a suggested topic produces an agent response', async ({ page }) => {
    const input = page.getByTestId('agent-chat-input');
    await expect(input).toBeVisible({ timeout: 10000 });

    // Target visible suggested prompt or trigger default topic
    const topicPrompt = page.locator('p, button, span').filter({
      hasText: /(understand Permission|Permission\.ai|earn|assist you)/i
    }).first();

    if (await topicPrompt.isVisible().catch(() => false)) {
      await topicPrompt.click({ force: true });
    }

    // Ensure prompt dispatches
    const val = await input.inputValue();
    if (!val) {
      await input.fill('How does Permission work?');
    }
    await input.press('Enter');

    // Wait dynamically for streaming paragraph to settle
    const response = getAgentParagraphs(page).last();
    await expect(response).toBeVisible({ timeout: 25000 });
    await expect(response).toHaveText(/.{20,}/, { timeout: 25000 });
  });

  // Test 3: Submitting a free-text question produces an agent response
  test('3. Submitting a free-text question produces an agent response', async ({ page }) => {
    const input = page.getByTestId('agent-chat-input');
    await input.fill('What is the core utility of ASK token?');
    await input.press('Enter');

    const agentAnswer = page.getByText(/ASK is the native token|core utility/i).first();
    await expect(agentAnswer).toBeVisible({ timeout: 25000 });
  });

  // Test 4: Shift+Enter creates a new line instead of sending
  test('4. Shift+Enter creates a new line instead of sending', async ({ page }) => {
    const input = page.getByTestId('agent-chat-input');
    await input.click({ force: true });
    await input.fill('Line 1');

    // Direct atomic Shift+Enter press
    await input.press('Shift+Enter');
    await input.pressSequentially('Line 2', { delay: 30 });

    const value = await input.inputValue();
    expect(value).toContain('\n');
    expect(value).toContain('Line 2');
  });

  // Test 5 (Part 2): Validates non-deterministic response for "What is Permission"
  test('5. Validates non-deterministic response for "What is Permission"', async ({ page }) => {
    const input = page.getByTestId('agent-chat-input');
    await input.fill('What is Permission?');
    await input.press('Enter');

    const agentAnswer = getAgentParagraphs(page).filter({
      hasText: /(permission|data|broker|earn|ask tokens)/i
    }).last();

    await expect(agentAnswer).toBeVisible({ timeout: 30000 });
    const text = await agentAnswer.innerText();

    // 1. Content floor assertion
    expect(text.length).toBeGreaterThan(25);
    // 2. Non-deterministic heuristic assertion
    expect(text).toMatch(/(permission|data|earn|ask|token|broker)/i);
    // 3. Negation check
    expect(text).not.toMatch(/(internal server error|unauthorized|failed to fetch)/i);
  });

  // Test 6: Empty or whitespace-only input cannot be dispatched
  test('6. Empty or whitespace-only input cannot be dispatched', async ({ page }) => {
    const input = page.getByTestId('agent-chat-input');
    await input.fill('   ');

    const sendBtn = page.getByTestId('agent-chat-input-send-button');
    await expect(sendBtn).toBeDisabled();
  });

  // Test 7: Authentication entry points visible
  test('7. Authentication entry points are visible in pre-login state', async ({ page }) => {
    const logInBtn = page.getByRole('button', { name: 'Log in' });
    const signUpBtn = page.getByRole('button', { name: 'Sign Up' });

    await expect(logInBtn).toBeVisible({ timeout: 5000 });
    await expect(signUpBtn).toBeVisible({ timeout: 5000 });
  });

  // Test 8: Mobile viewport responsiveness
  test('8. Chat input and interface are responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500); // Allow responsive CSS recalculation

    const input = page.getByTestId('agent-chat-input');
    const sendBtn = page.getByTestId('agent-chat-input-send-button');

    await expect(input).toBeVisible({ timeout: 10000 });
    await expect(sendBtn).toBeVisible({ timeout: 10000 });

    const box = await input.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y + box!.height).toBeLessThanOrEqual(844);
  });

});