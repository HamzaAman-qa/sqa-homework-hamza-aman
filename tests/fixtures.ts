import { test as base } from '@playwright/test';
import { AgentChatPage } from './pages/agent-chat.page';

export const test = base.extend<{ chatPage: AgentChatPage }>({
  chatPage: async ({ page }, use) => {
    const chatPage = new AgentChatPage(page);
    await chatPage.goto();
    await use(chatPage);
  },
});

export { expect } from '@playwright/test';
