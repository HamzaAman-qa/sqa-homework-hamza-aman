# Senior Quality Assurance Engineer — Take-Home Submission

Automated test suite and architecture validation for https://ask.permission.ai.

## Setup & Execution

Verify from clean clone in ~2 minutes:

```bash
# 1. Install dependencies
npm install

# 2. Install Chromium browser binary
npx playwright install chromium

# 3. Run all 8 automated tests
npm test

# 4. (Optional) Run LLM response eval check
npm run test:eval

# 5. View test report
npx playwright show-report artifacts/report