import { isTemplateRepository } from '../../src/policy/template-repository-policy.mjs';

test('detects the validation-only template marker', () => { expect(isTemplateRepository({ existsSync: file => file === '.notag' })).toBe(true); expect(isTemplateRepository({ existsSync: () => false })).toBe(false); });
