import { readWorktreeStatus } from '../../../src/repository/state/read-worktree-status.mjs';
test('reads all worktree status entries', () => { expect(readWorktreeStatus(() => ' M file\n')).toBe('M file'); });
