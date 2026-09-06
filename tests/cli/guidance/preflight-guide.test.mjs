import { preflightGuide } from '../../../src/cli/guidance/preflight-guide.mjs';
test('documents shared validation and optional Windows CI', () => {
  expect(preflightGuide()).toContain('shared harness owns tests, lint, typecheck, audit, packaging');
  expect(preflightGuide()).toContain('Windows CI is optional but must pass when present');
});
