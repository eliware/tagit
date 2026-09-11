import { readRepositoryName } from '../../repository/repository-name/read-repository-name.mjs';
import { releaseTag } from '../../policy/tag-policy.mjs';

export function resolveReleaseContext(execFileSync, version, release) {
  const tag = releaseTag(version);
  const resolvedSha = execFileSync('git', ['rev-parse', tag]).toString().trim();
  if (resolvedSha !== release.commitSha)
    throw new Error(`Release tag ${tag} resolves to ${resolvedSha}, not the supplied commit ${release.commitSha}.`);
  return {
    repo: readRepositoryName(execFileSync),
    tag,
    headSha: resolvedSha,
  };
}
