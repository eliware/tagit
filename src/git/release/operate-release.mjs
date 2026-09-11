/**
 * Release operates on an already prepared and preflighted HEAD. Its only
 * repository mutation is creating/reusing and pushing the release tag.
 */
import { releaseTag as releaseTagForVersion } from '../../policy/tag-policy.mjs';
import { runReleaseTagTransaction } from './run-release-tag-transaction.mjs';
import { runGit } from '../commands/run-git.mjs';
import { pushTag } from '../tags/push-tag.mjs';
import { prepareReleaseTag } from './prepare-release-tag.mjs';
import { verifyRemoteTag } from '../tags/verify-remote-tag.mjs';

export function gitOperations(execFileSync, _fs, log, newVersion, { dryRun = false } = {}) {
  const releaseTag = releaseTagForVersion(newVersion);
  if (dryRun) {
    log.info(`Dry run complete: ${newVersion} was not released`);
    return;
  }

  log.info('Starting git operations');
  return runReleaseTagTransaction({
    execFileSync,
    log,
    releaseTag,
    prepareReleaseTag,
    pushTag,
    runGit,
    verifyRemoteTag,
  });
}
