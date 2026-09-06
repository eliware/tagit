import { validateCurrentHead } from '../tags/validate-release-tag.mjs';
import { resolveExistingTag } from '../tags/resolve-existing-tag.mjs';
import { createTag } from '../tags/create-tag.mjs';

export function prepareReleaseTag(execFileSync, log, releaseTag) {
  const runFile = (executable, args, options) => execFileSync(executable, args, options);
  const { currentHead } = validateCurrentHead(runFile('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }), null);
  const existing = resolveExistingTag(runFile, releaseTag, currentHead);
  if (existing.reuse) log.info(`Tag ${releaseTag} already points to HEAD; reusing existing release CI.`);
  else {
    if (existing.existingTagHead)
      throw new Error(
        `Release tag ${releaseTag} already points to ${existing.existingTagHead}, not HEAD ${currentHead}.`,
      );
    log.info(`Tagging commit with tag: ${releaseTag}`);
    createTag((args, options) => runFile('git', args, options), releaseTag, currentHead);
  }
  return { currentHead };
}
