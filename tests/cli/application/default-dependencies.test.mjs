import { defaultDependencies } from '../../../src/cli/application/default-dependencies.mjs';
test('builds the production dependency boundary', () => expect(defaultDependencies()).toEqual(expect.objectContaining({ fs: expect.anything(), execFileSync: expect.any(Function), execFile: expect.any(Function), exit: expect.any(Function) })));
