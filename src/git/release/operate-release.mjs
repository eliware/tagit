/**
 * Release operates on an already prepared and preflighted HEAD. Its only
 * repository mutation is creating/reusing and pushing the release tag.
 */
import { releaseTag as releaseTagForVersion } from '../../policy/tag-policy.mjs';

export function gitOperations(execFileSync, _fs, log, newVersion, { dryRun = false } = {}) {
    const releaseTag = releaseTagForVersion(newVersion);
    const runFile = (executable, args, options = {}) => execFileSync(executable, args, options);

    if (dryRun) {
        log.info(`Dry run complete: ${newVersion} was not released`);
        return;
    }

    let remoteSideEffects = false;
    log.info('Starting git operations');
    try {
        const git = (args, options = {}) => runGit(execFileSync, args, options);
        const currentHeadOutput = runFile('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' });
        const { currentHead } = validateCurrentHead(currentHeadOutput, null);
        const existing = resolveExistingTag(runFile, releaseTag, currentHead);
        const existingTagHead = existing.existingTagHead;
        if (existing.reuse) {
            log.info(`Tag ${releaseTag} already points to HEAD; reusing existing release CI.`);
        } else {
            if (existingTagHead) {
                throw new Error(`Release tag ${releaseTag} already points to ${existingTagHead}, not HEAD ${currentHead}.`);
            }
            log.info(`Tagging commit with tag: ${releaseTag}`);
            createTag((args, options) => git(args, options), releaseTag, currentHead);
        }
        log.info('Pushing tags to origin');
        remoteSideEffects = true;
        pushTag((args, options) => git(args, options), releaseTag);
        const remoteTag = String(git(['ls-remote', '--tags', 'origin', `refs/tags/${releaseTag}`, `refs/tags/${releaseTag}^{}`], { encoding: 'utf8' }) ?? '').trim();
        verifyRemoteTag(remoteTag, releaseTag, currentHead);
        log.info('Git operations complete');
        return { commitSha: currentHead, tag: releaseTag };
    } catch (error) {
        log.error(remoteSideEffects
            ? 'Tag push failed after remote side effects; local files were preserved for reconciliation.'
            : 'Release tag operation failed before remote side effects.');
        throw error;
    }
}
import { validateCurrentHead } from '../tags/validate-release-tag.mjs';
import { verifyRemoteTag } from '../tags/verify-remote-tag.mjs';
import { resolveExistingTag } from '../tags/resolve-existing-tag.mjs';
import { runGit } from '../commands/run-git.mjs';
import { createTag } from '../tags/create-tag.mjs';
import { pushTag } from '../tags/push-tag.mjs';
