import { validateCurrentHead } from './validate-release-tag.mjs';

export function resolveExistingTag(runFile, releaseTag, currentHead) {
  const existingTag = String(runFile('git', ['tag', '--list', releaseTag], { encoding: 'utf8' })).trim();
  if (!existingTag) return { existingTagHead: null, reuse: false };
  const existingTagHead = validateCurrentHead(
    currentHead,
    runFile('git', ['rev-parse', releaseTag], { encoding: 'utf8' }),
  ).existingTagHead;
  return { existingTagHead, reuse: existingTagHead === currentHead };
}
