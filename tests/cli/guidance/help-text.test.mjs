import { helpText } from '../../../src/cli/guidance/help-text.mjs';
test('documents the owner and DevOps command boundary', () => { expect(helpText()).toContain('Project owners may run only notes, push, and preflight.'); expect(helpText()).toContain('DevOps runs release and release-wait only after preflight passes.'); });
