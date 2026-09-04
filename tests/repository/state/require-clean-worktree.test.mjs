import { requireCleanWorktree } from '../../../src/repository/state/require-clean-worktree.mjs';
test('allows clean state and reports dirty state', () => { expect(requireCleanWorktree('')).toBeNull(); expect(requireCleanWorktree(' M file')).toContain('uncommitted changes'); });
